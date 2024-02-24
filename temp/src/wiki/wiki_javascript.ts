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


export let generate_wiki: vscode.Disposable = vscode.commands.registerCommand('temp.wiki-javascript', (args) => {

  const openFilePath = vscode.window.activeTextEditor?.document.fileName;

  // root folder
  const x = vscode.window.activeTextEditor?.document.uri;
  if (x) {
    var workspaceFolder = vscode.workspace.getWorkspaceFolder(x)?.uri.fsPath;
  }

  // const openFilePathStr = openFilePath?.toString();

  // console.log(process.cwd());

  // // create zip file of the workspace folder
  // const zip = new JSZip();

  if (!openFilePath) {
    return;
  }

  madge(openFilePath).then((res) => {
    console.log((res as any).tree);
  });

  // exec(`npx madge --json ${openFilePath} > temp.json`, (error, stdout, stderr) => {
  //   if (error) {
  //     console.error(`Error: ${error.message}`);
  //     return;
  //   }
  //   if (stderr) {
  //     console.error(`stderr: ${stderr}`);
  //     return;
  //   }
  //   console.log(`stdout: ${stdout}`);

  //   const cwd = process.cwd();

  //   // get the temp.json file from the cwd
  //   const tempJsonPath = `${cwd}/temp.json`;
  
  //   console.log("path", tempJsonPath);
  
  //   const data = fs.readFileSync(tempJsonPath, 'utf8');
  
  //   console.log(data);

  // });

});

