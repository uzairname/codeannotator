import { DiagnosticChangeEvent, languages, window, ExtensionContext, OverviewRulerLane, TextEditorDecorationType, workspace, TextEditor, TextDocument } from 'vscode';
import { createHash } from 'crypto';

import { highlightCodeChunk } from './extension';
import { line } from 'd3';
import { updateChunk } from './api';

type ChunkMetadata = {
  start: number
  end: number
};

type Chunk = {
  metadata: ChunkMetadata
  lines: string[]
};

let activeDecorations: TextEditorDecorationType[] = [];

let currentContext: ExtensionContext | undefined;

let currentProjectPath: string | undefined;
let currentFilePath: string | undefined;

function updateAllHashes(allHashes: Set<string>) {
  if(currentContext == undefined){
    console.log("no context");
    return;
  }
  let all = "";
  for(const hash of allHashes){
    all += hash + ":";
  }
  currentContext!.globalState.update("allHashes", all.slice(0, -1))
}

export function fullScan(context: ExtensionContext) {
  currentContext = context;
  const editor = window.activeTextEditor;
  if(editor == undefined) return;
  const docText = editor.document.getText();
  let uniq: Set<string> = new Set();
  for(let i = 0;i < editor.document.lineCount;i++) {
    const chunk = getChunk(docText, i);
    const hash = hashChunk(chunk);
    currentContext!.globalState.update(`hash:${hash}`, `${chunk.metadata.start}:${chunk.metadata.end + 1}`);
    uniq.add(hash);
    context.globalState.update(`line:${i}`, hash);
  }

  removeAllHighlights();
  updateAllHashes(uniq);
  // highlightAllChunks();
}

export function onChangeDiagnostics(e: DiagnosticChangeEvent) {
  for(let i = 0;i<window.visibleTextEditors.length;i++) {
    const err = languages.getDiagnostics(e.uris[0]).length;
    if(window.visibleTextEditors[i].document.uri.path == e.uris[0].path && err == 0) {
      const docText = window.visibleTextEditors[i].document.getText();
      handleDocumentChange(docText, window.visibleTextEditors[i].selection.active.line);
    }
  } 
}

function seed(state1: number){
    var mod1=4294967087
    var mul1=65539
    var mod2=4294965887
    var mul2=65537
    if(typeof state1!="number"){
        state1=+new Date()
    }
    let state2 = state1;
    state1=state1%(mod1-1)+1
    state2=state2%(mod2-1)+1
    function random(limit: number){
        state1=(state1*mul1)%mod1
        state2=(state2*mul2)%mod2
        if(state1<limit && state2<limit && state1<mod1%limit && state2<mod2%limit){
            return random(limit)
        }
        return (state1+state2)%limit
    }
    return random
}

function highlightAllChunks() {
  if(currentContext == undefined){
    console.log("no context");
    return;
  }

  const allHashes: string = currentContext!.globalState.get("allHashes")!;
  const hashesList = allHashes.split(":");
  for(let i = 0;i<hashesList.length;i++){
    const lines: string = currentContext!.globalState.get(`hash:${hashesList[i]}`)!;
    const linesSplit = lines.split(':');
    const start = parseInt(linesSplit[0], 10);
    const end = parseInt(linesSplit[1], 10); 

    const hash = hashesList[i];
    const r = parseInt(hash.slice(0, 21), 16);
    const rGen = seed(r);
    const g = parseInt(hash.slice(21, 42), 16);
    const gGen = seed(g);
    const b = parseInt(hash.slice(42, 63), 16);
    const bGen = seed(b);

    let color = `rgba(${rGen(255)}, ${gGen(255)}, ${bGen(255)}, 0.6)`;

    let decorationType = window.createTextEditorDecorationType({
		  overviewRulerColor: color,
		  overviewRulerLane: OverviewRulerLane.Full,
      backgroundColor: color,
    });

    activeDecorations.push(decorationType);
    highlightCodeChunk(start, end, decorationType);
  }
}

function removeAllHighlights() {
  const editor = window.activeTextEditor;
	if(editor){
    for(let i = 0;i<activeDecorations.length;i++){
      editor.setDecorations(activeDecorations[i], []);
    }
    activeDecorations = [];
	}else {
    console.log("no active code editor");
  }
}

function handleDocumentChange(docText: string, line: number) {
  if(currentContext == undefined){
    console.log("no context");
    return;
  }
  const chunk = getChunk(docText, line);
  const oldHash: string = currentContext!.globalState.get(`line:${line}`)!;
  const newHash: string = hashChunk(chunk);
  const allHashes: string = currentContext!.globalState.get("allHashes")!;
  let all: Set<string> = new Set(allHashes.split(':'));
  all.delete(oldHash);
  all.add(newHash);
  updateAllHashes(all);
  currentContext!.globalState.update(`hash:${oldHash}`, undefined);
  currentContext!.globalState.update(`hash:${newHash}`, `${chunk.metadata.start}:${chunk.metadata.end + 1}`);
  if(oldHash != newHash){
    updateChunk(oldHash, newHash);
  }
  for(let i = chunk.metadata.start;i<=chunk.metadata.end;i++){
    currentContext!.globalState.update(`line:${i}`, newHash);
  }
  removeAllHighlights();
  // highlightAllChunks();
}

export function getChunk(text: string, line: number): Chunk {
  const lines = text.split('\n');
  
  var t: number = line;
  var b: number = line;

  function checkLevel(text: string) {
    var i = 0;
    while(text[i] == ' ') i++;
    return i;
  }

  let level = (lines[line] == '') ? -1 : checkLevel(lines[line]);

  const scopeStart = lines[line].length != 0 && lines[line][lines[line].length - 1] == ':';

  if(scopeStart) {
    level += 4;
  }

  function expandUpwards() {
    while(t > 0) {
      const next = lines[t - 1];
      const nextLevel = checkLevel(next); 

      if(next == ''){
        t--;
        continue;
      }

      if(nextLevel == level || level == -1){
        level = nextLevel;
        t--;
        continue;
      }

      if(next[next.length - 1] == ':') t--;

      break; 
    }

    // dont include empty lines above
    while(lines[t] == '')t++;
  }

  function expandDownwards() {
    while(b < lines.length - 1) {
      const next = lines[b + 1];
      const nextLevel = checkLevel(next); 

      if(next == ''){
        b++;
        continue;
      }

      if(nextLevel == level || level == -1){
        level = nextLevel;
        b++;
        continue;
      }

      break; 
    }

    // include top level scope-starters
    while(!(scopeStart && b == line) && b > 0 && lines[b][lines[b].length - 1] == ':') b--;
  }

  if(!scopeStart)expandUpwards();
  expandDownwards();

  return {metadata: {start: t, end: b}, lines: lines.slice(t, b + 1)};
}

export function hashChunk(chunk: Chunk): string {
  return createHash('sha256').update(chunk.lines.join('\n')).digest('hex');
}

export function hashString(string: string): string {
  return createHash('sha256').update(string).digest('hex');
}

export function getProjectPath(): string {
  currentProjectPath = workspace.workspaceFolders![0].uri.path;
  return currentProjectPath;
}

export function getFilePath(d: TextDocument | undefined = undefined): string {
  if(d == undefined) d = window.activeTextEditor!.document;
  currentFilePath = (d.uri.path.split(getProjectPath()))[1];
  return currentFilePath;
}
