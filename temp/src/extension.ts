// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import fs from 'fs';
import path from 'path';

import { onChangeDiagnostics, fullScan } from './chunk-algo';
import { generate_wiki } from './wiki/wiki_javascript';
import * as puppeteer from 'puppeteer';
import { create_graph_cmd } from './wiki/wiki_python';

// Define a global variable to store the decoration type
let decorationType = vscode.window.createTextEditorDecorationType({
		overviewRulerColor: 'blue',
		overviewRulerLane: vscode.OverviewRulerLane.Right,
        backgroundColor: 'rgba(142, 13, 255, 0.3)',
});

// Gets the thumbnail image of a website
export async function getThumbnail(url: string): Promise<string | undefined> {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

		const [response] = await Promise.all([
			page.waitForResponse(response => response.url().includes('.png')),
			page.goto(url)
		]);
		const buffer = await response.buffer();
		await browser.close();

		return 'data:image/png;base64,' + buffer.toString('base64');
    } catch (error) {
        console.error('Error retrieving thumbnail:', error);
        return undefined;
    }
}

// Highlights code chunks
export function highlightCodeChunk(start: number, end: number) {

    // Get the active text editor
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        // Determine the range of the code chunk to highlight
        const startLine = start; // Example: line number where the code chunk starts
        const endLine = end; // Example: line number where the code chunk ends
        const startPosition = new vscode.Position(startLine, 0);
        const endPosition = new vscode.Position(endLine, 0);
        const range = new vscode.Range(startPosition, endPosition);

        // Apply the decoration to the specified range
        editor.setDecorations(decorationType, [range]);
    }
}

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


			if(workspaceFolder)
			{
				let chunk_id = 2;
				let start_id = 2;
				let end_id = 8;
				if (position.line >= start_id && position.line <= end_id)
				{
					console.log(position.line);

					//highlightCodeChunk(start_id, end_id);
	
					let url = "https://web-highlights.com/blog/turn-your-website-into-a-beautiful-thumbnail-link-preview/";
					let thumbnailDataPromise = getThumbnail(url);
					let markdownContent = '';
		
					return thumbnailDataPromise.then((thumbnailData: string | undefined) =>
					{
						if(thumbnailData)
						{
							console.log(thumbnailData);
	
							markdownContent = [
								'## URL Preview',
								'',
								`![](${thumbnailData})`,
								'',
								`[Visit URL](${url})`
							].join('\n');
	
						}

						const md = new vscode.MarkdownString(markdownContent, true);
						md.isTrusted = true;
						console.log(md);
						return new vscode.Hover(md);
					});

				}
				else{
					const editor = vscode.window.activeTextEditor;

					if(editor){
						editor.setDecorations(decorationType, []);
					}

					return {
						contents: ['Default']
					};
				}
			}
		}
	});
	// context.subscriptions.push(disposable);
  let onDiagnostics = vscode.languages.onDidChangeDiagnostics(onChangeDiagnostics);

  let scan = vscode.commands.registerCommand('temp.scan', () => {
    fullScan()
  });

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(onDiagnostics);
  context.subscriptions.push(scan);

	context.subscriptions.push(generate_wiki);
	context.subscriptions.push(create_graph_cmd);

}

exports.activate = activate;
// This method is called when your extension is deactivated
export function deactivate() {}
