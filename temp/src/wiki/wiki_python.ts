import * as vscode from 'vscode';
import spawn from 'child_process';


export let create_graph_cmd: vscode.Disposable = vscode.commands.registerCommand('temp.wiki-python', (args) => {

  const openFilePath = vscode.window.activeTextEditor?.document.fileName;

  // root folder
  const x = vscode.window.activeTextEditor?.document.uri;
  if (x) {
    var workspaceFolder = vscode.workspace.getWorkspaceFolder(x)?.uri.fsPath;
  }
  
  vscode.window.showInformationMessage(`openFilePath ${openFilePath} ...`);
  vscode.window.showInformationMessage(`workspaceFolder ${workspaceFolder} ...`);

  if (!openFilePath) {
    return;
  }
  const openFilePathStr = openFilePath?.toString();

  console.log(process.cwd());
  const cwd = process.cwd();
  const pythonProcess = spawn.spawn('python', ['create_graphh.py', openFilePathStr], {cwd, stdio: 'inherit'});

  pythonProcess.stdout?.on('data', (data) => {
    console.log('Output from Python:', data.toString());
  });

  pythonProcess.stderr?.on('error', (error) => {
      console.error('Error from Python:', error);
  });

});
