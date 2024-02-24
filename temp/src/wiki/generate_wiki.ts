import * as vscode from 'vscode';
import fs from 'fs';
import {exec, spawn} from 'child_process';


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


export let generate_wiki: vscode.Disposable = vscode.commands.registerCommand('temp.wiki', (args) => {

  const openFilePath = vscode.window.activeTextEditor?.document.fileName;

  // root folder
  const x = vscode.window.activeTextEditor?.document.uri;
  if (x) {
    var workspaceFolder = vscode.workspace.getWorkspaceFolder(x)?.uri.fsPath;
  }
  
  vscode.window.showInformationMessage(`openFilePath ${openFilePath} ...`);
  vscode.window.showInformationMessage(`workspaceFolder ${workspaceFolder} ...`);

  exec(`npx madge --json ${openFilePath} < graph.json`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });


});

