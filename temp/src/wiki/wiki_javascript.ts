import * as vscode from 'vscode';
import fs, { read } from 'fs';
import {exec, spawn} from 'child_process';
import JSZip from 'jszip';
import madge from 'madge';
import * as d3 from 'd3';
import path from 'path';
import { summarizeFile } from "./code_describer";
import dotenv from 'dotenv';



// function runNpxCommand(command: string, args = [], options = {}) {
//   return new Promise((resolve, reject) => {
//     const npxProcess = spawn('npx', command.split(' ').concat(args), options);

//     let output = '';
//     let errorOutput = '';

//     npxProcess.stdout.on('data', (data) => output += data.toString());
//     npxProcess.stderr.on('data', (data) => errorOutput += data.toString());

//     npxProcess.on('close', (code) => {
//       if (code === 0) {
//         resolve(output);
//       } else {
//         reject(new Error(`npx command exited with code ${code}:\n${errorOutput}`));
//       }
//     });
//   });
// }


function resolveAbsolutePath(pathToA: string, relativePathFromA: string) {
  const absoluteDirectoryOfA = path.dirname(pathToA);
  const absolutePathToB = path.resolve(absoluteDirectoryOfA, relativePathFromA);

  return absolutePathToB;
}

interface DependencyGraphData {
  nodes: { id: string }[];
  links: { source: string, target: string }[];
}

async function visualizeMadgeOutput(json: Object) {
}

export let generate_wiki: vscode.Disposable = vscode.commands.registerCommand('temp.wiki-javascript', async (args) => {

  const openFilePath = vscode.window.activeTextEditor?.document.fileName;

  // root folder
  const x = vscode.window.activeTextEditor?.document.uri;
  if (x) {
    var workspaceFolder = vscode.workspace.getWorkspaceFolder(x)?.uri.fsPath;
  }

  if (!openFilePath) {
    return;
  }

  const graph_json = await madge(openFilePath).then((res) => {
    const tree = (res as any).tree;
    console.log(tree);
    return tree;
  });
  // save graph_json to file
  fs.writeFileSync
  (
    `${workspaceFolder}/graph.json`,
    JSON.stringify(graph_json, null, 2)
  );

  const keys = Object.keys(graph_json);


  const env = fs.readFileSync(`${workspaceFolder}/.env`, 'utf8');
  // get OPENAI_API_KEY from .env
  const OPENAI_API_KEY = dotenv.parse(env).OPENAI_API_KEY;

  const file_summary_json: {[key: string]: any} = {};
    
  for (const relative_path of keys.slice(0, 11)) {
    console.log("summarizing", relative_path);
    const absolute_path = resolveAbsolutePath(openFilePath, relative_path);
    const summary = await summarizeFile(absolute_path, graph_json, OPENAI_API_KEY);
    const file_name = path.basename(absolute_path);
    file_summary_json[relative_path] = summary;
  }
  console.log('done summarizing');

  // save file_summary_json to file
  fs.writeFileSync
  (
    `${workspaceFolder}/wiki.json`,
    JSON.stringify(file_summary_json, null, 2)
  );

});

