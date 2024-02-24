// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import fs from 'fs';
import path from 'path';

import { onChangeDiagnostics, fullScan } from './chunk-algo';
import { generate_wiki } from './wiki/wiki_javascript';
import * as puppeteer from 'puppeteer';
import exp from 'constants';
import { create_graph_cmd } from './wiki/wiki_python';

// Define a global variable to store the decoration type
let decorationType = vscode.window.createTextEditorDecorationType({
		overviewRulerColor: 'blue',
		overviewRulerLane: vscode.OverviewRulerLane.Right,
        backgroundColor: 'rgba(142, 13, 255, 0.3)',
});

// Global variables to store the elapsed time
let hours = 0;
let minutes = 0;
let seconds = 0;
let startTime: Date | undefined;
let intervalId: NodeJS.Timeout | undefined;

// Generate the HTML content for the webview
export function generateHtmlContent() {
	return `
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<script src="stat_script.js"></script>
		<title>User Stats</title>
	</head>
	<body>
		<div id="time" style="display: flex; flex-direction: row; flex-wrap: nowrap; min-width: 100%; padding: auto; margin: auto; align-items: center; justify-content: center;">
			<div style="display: flex; margin: auto; flex-direction: column; justify-content: center; align-items: center;">
				<h1>${hours} :</h1>
				HOURS
			</div>
			<div style="display: flex; margin: auto; flex-direction: column; justify-content: center; align-items: center;"">
				<h1>${minutes} :</h1>
				MINUTES
			</div>
			<div style="display: flex; margin: auto; flex-direction: column; justify-content: center; align-items: center;"">
				<h1>${seconds}</h1>
				SECONDS
			</div>
		</div>
	</body>
	</html>
	`;

}

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

	//
	// Hover Provider
	//
	vscode.languages.registerHoverProvider('python', {
		provideHover(document, position, token)
		{
			const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);


			if(workspaceFolder)
			{
				// GET chunk id, start, end here
				let chunk_id = 2;
				let start_id = 2;
				let end_id = 8;
				if (position.line >= start_id && position.line <= end_id)
				{
					console.log(position.line);

					highlightCodeChunk(start_id, end_id);
	
					// GET URL for associated chunk here
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
    fullScan();
  });

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(onDiagnostics);
	context.subscriptions.push(scan);

	//
	// WebView for productivity statistics
	//

	// Create a status bar item
	const statusBarItem = vscode.window.createStatusBarItem(
	vscode.StatusBarAlignment.Left, // Align the item to the left side of the status bar
	100 // Priority of the item (lower values come first)
	);

	// Set the text and tooltip for the status bar item
	statusBarItem.text = "$(globe) Dashboard";
	statusBarItem.tooltip = "Open Stats Dashboard";

	// Register a command for the status bar item
	statusBarItem.command = 'extension.openWebview';

	// Show the status bar item
	statusBarItem.show();

	// Register a command handler for opening the webview
	context.subscriptions.push(vscode.commands.registerCommand('extension.openWebview', () => {
		  // Create and show a new webview panel
		  const panel = vscode.window.createWebviewPanel(
			'customWebview', // Unique ID for the webview
			'User Dashboard', // Title of the panel
			vscode.ViewColumn.Two, // Desired column for the panel (e.g., ViewColumn.One, ViewColumn.Two)
			{
				enableScripts: true // Enable JavaScript in the webview
			}
		);
	
		panel.webview.html = generateHtmlContent();
	}
	));

	//
	// Session Times
	//

    function updateSessionTime() {
        if (startTime) {
            const currentTime = new Date();
            const elapsedTime = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000); // Elapsed time in seconds

            // Format elapsed time
            const lhours = Math.floor(elapsedTime / 3600);
            const lminutes = Math.floor((elapsedTime % 3600) / 60);
            const lseconds = elapsedTime % 60;

			hours = lhours;
			minutes = lminutes;
			seconds = lseconds;

			console.log(hours, minutes, seconds);
        }
	}

	function startSessionTimer() {
        startTime = new Date();
        updateSessionTime();
        // Update elapsed time every second
        intervalId = setInterval(updateSessionTime, 1000);
    }

    function stopSessionTimer() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = undefined;
        }
        startTime = undefined;
		hours = 0;
		minutes = 0;
		seconds = 0;
    }

	// Start session timer when workspace is opened
    vscode.workspace.onDidOpenTextDocument(() => {
        startSessionTimer();
    });

    // Stop session timer when workspace is closed
    vscode.workspace.onDidCloseTextDocument(() => {
        stopSessionTimer();
    });

	context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(() => {
        if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
            stopSessionTimer();
        }
    }));
}

exports.activate = activate;
// This method is called when your extension is deactivated
export function deactivate() {}
