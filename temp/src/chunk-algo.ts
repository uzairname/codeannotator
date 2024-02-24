import { DiagnosticChangeEvent, languages, window } from 'vscode';
import { createHash } from 'crypto';

type ChunkMetadata = {
  start: number
  end: number
}

type Chunk = {
  metadata: ChunkMetadata
  lines: string[]
}

export function fullScan() {
  const editor = window.activeTextEditor;
  if(editor == undefined) return;
  const docText = editor.document.getText();
  for(let i = 0;i < editor.document.lineCount;i++) {
    const chunk = getChunk(docText, i);
    console.log(`${i + 1} -> ${chunk.metadata.start + 1}-${chunk.metadata.end + 1}: ${hashChunk(chunk)}`);
  }
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

function handleDocumentChange(docText: string, line: number) {
  const chunk = getChunk(docText, line);
  console.log(hashChunk(chunk));
}

function getChunk(text: string, line: number): Chunk {
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
    while((!scopeStart && b == line) && b > 0 && lines[b][lines[b].length - 1] == ':') b--;
  }

  if(!scopeStart)expandUpwards();
  expandDownwards();

  return {metadata: {start: t, end: b}, lines: lines.slice(t, b + 1)};
}

function hashChunk(chunk: Chunk): string {
  return createHash('sha256').update(chunk.lines.join('\n')).digest('hex');
}
