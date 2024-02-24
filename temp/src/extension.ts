// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import fs from 'fs';
import path from 'path';

import { parse_command } from './parse_code/parse_command';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "temp" is now active!.');

	context.subscriptions.push(
		vscode.commands.registerCommand('extension.openImage', (imgPath) =>
		{
			vscode.commands.executeCommand('vscode.open', vscode.Uri.file(imgPath));
		})
	);

	vscode.languages.registerHoverProvider('python', {
		provideHover(document, position, token)
		{
			const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);

			if (workspaceFolder)
				{
					const rootPath = workspaceFolder.uri.fsPath;
					const imgPath = path.join(rootPath, "sample.png");

					if (fs.existsSync(imgPath))
					{
						const imgUri = vscode.Uri.file(imgPath).toString();

						const hoverContent = [
							'# Image Comments',
							'',
							`[Open Image](command:extension.openImage?${encodeURIComponent(JSON.stringify(imgPath))})`,
							'',
							`![Image](${imgUri})`,
						].join('\n');

						const md = new vscode.MarkdownString(hoverContent, true);
						md.isTrusted = true;
						return new vscode.Hover(md);
					} else {
						console.error(`Image not found: ${imgPath}`);
					}
				}
		}
	});
	// context.subscriptions.push(disposable);
  let onKeystroke = vscode.workspace.onDidChangeTextDocument((e) => {
    const changes = e.contentChanges;
	  const start = changes[0].range.start;
	  const text = changes[0].text;
    console.log(`${start.line} - ${JSON.stringify(text)}`);
  });

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
  context.subscriptions.push(onKeystroke);

	context.subscriptions.push(parse_command);
}

exports.activate = activate;
// This method is called when your extension is deactivated
export function deactivate() {}
