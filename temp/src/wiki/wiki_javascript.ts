import * as vscode from 'vscode';
import fs from 'fs';
import {exec, spawn} from 'child_process';
import JSZip from 'jszip';
import madge from 'madge';
import * as d3 from 'd3';


function runNpxCommand(command: string, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const npxProcess = spawn('npx', command.split(' ').concat(args), options);

    let output = '';
    let errorOutput = '';

    npxProcess.stdout.on('data', (data) => output += data.toString());
    npxProcess.stderr.on('data', (data) => errorOutput += data.toString());

    npxProcess.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`npx command exited with code ${code}:\n${errorOutput}`));
      }
    });
  });
}


interface DependencyGraphData {
  nodes: { id: string }[];
  links: { source: string, target: string }[];
}

async function visualizeMadgeOutput(json: Object) {

}

export let generate_wiki: vscode.Disposable = vscode.commands.registerCommand('temp.wiki-javascript', (args) => {

  const openFilePath = vscode.window.activeTextEditor?.document.fileName;

  // root folder
  const x = vscode.window.activeTextEditor?.document.uri;
  if (x) {
    var workspaceFolder = vscode.workspace.getWorkspaceFolder(x)?.uri.fsPath;
  }

  if (!openFilePath) {
    return;
  }

  const graph_json = madge(openFilePath).then((res) => (res as any).tree);

  console.log(graph_json);

  // TODO: graph the graph_json

});

