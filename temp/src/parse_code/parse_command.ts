import * as vscode from 'vscode';
import spawn from 'child_process';
import fs from 'fs';

export let parse_command: vscode.Disposable = vscode.commands.registerCommand('temp.parse', (args) => {

  const openFilePath = vscode.window.activeTextEditor?.document.fileName;

  // root folder
  const x = vscode.window.activeTextEditor?.document.uri;
  if (x) {
    var workspaceFolder = vscode.workspace.getWorkspaceFolder(x)?.uri.fsPath;
  }
  
  vscode.window.showInformationMessage(`openFilePath ${openFilePath} ...`);
  vscode.window.showInformationMessage(`workspaceFolder ${workspaceFolder} ...`);

  const scriptPath = `parse_code/create_graph.py`;

  const pythonProcess = spawn.spawn('python', [scriptPath], { cwd: workspaceFolder });

  pythonProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
});

