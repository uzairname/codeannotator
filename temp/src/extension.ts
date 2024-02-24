// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import fs from 'fs';
import path from 'path';

import { parse_command } from './parse_code/parse_command';
import * as puppeteer from 'puppeteer';

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
				if (position.line === chunk_id)
				{
					console.log(position.line);
	
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

}

exports.activate = activate;
// This method is called when your extension is deactivated
export function deactivate() {}
