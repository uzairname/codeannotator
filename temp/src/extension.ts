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
		<link href="https://cdnjs.cloudflare.com/ajax/libs/vis/4.21.0/vis.min.css" rel="stylesheet" type="text/css">
    	<script src="https://cdnjs.cloudflare.com/ajax/libs/vis/4.21.0/vis.min.js"></script>
		<title>User Stats</title>
	</head>
	<body style="background-color: #12011f; color: #eed9ff;">
		<div id="time" style="display: flex; flex-direction: row; flex-wrap: nowrap; min-width: 100%; padding: auto; margin: auto; align-items: center; justify-content: center; border-style: solid; padding: auto; border-radius: 5px;">
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

		<div id="graph" style="min-width: 100%; border: solid; min-height: 100vh;"></div>

    <script>
        // Sample adjacency list
        const adjacencyList = {
  "database/cache.ts": ["database/models/all.ts"],
  "database/client.ts": [
    "database/cache.ts",
    "database/models/all.ts",
    "request/globals.ts",
    "request/sentry.ts"
  ],
  "database/models/all.ts": [
    "database/models/models/guild_leaderboards.ts",
    "database/models/models/guilds.ts",
    "database/models/models/leaderboard_divisions.ts",
    "database/models/models/leaderboards.ts",
    "database/models/models/matches.ts",
    "database/models/models/players.ts",
    "database/models/models/queue_team.ts",
    "database/models/models/settings.ts",
    "database/models/models/users.ts"
  ],
  "database/models/models/guild_leaderboards.ts": [
    "database/client.ts",
    "database/models/models/guilds.ts",
    "database/models/models/leaderboards.ts"
  ],
  "database/models/models/guilds.ts": [
    "database/client.ts",
    "database/models/models/guild_leaderboards.ts",
    "database/models/models/leaderboards.ts"
  ],
  "database/models/models/leaderboard_divisions.ts": [
    "database/client.ts",
    "database/models/models/matches.ts",
    "database/models/models/players.ts"
  ],
  "database/models/models/leaderboards.ts": [
    "database/client.ts",
    "database/models/models/guild_leaderboards.ts",
    "database/models/models/leaderboard_divisions.ts"
  ],
  "database/models/models/matches.ts": ["database/client.ts"],
  "database/models/models/players.ts": [
    "database/client.ts",
    "database/models/models/leaderboard_divisions.ts",
    "database/models/models/users.ts"
  ],
  "database/models/models/queue_team.ts": ["database/client.ts"],
  "database/models/models/settings.ts": ["database/client.ts"],
  "database/models/models/users.ts": ["database/client.ts"],
  "discord/interactions/respond.ts": [
    "discord/interactions/types.ts",
    "discord/interactions/view_helpers.ts",
    "discord/rest/discord_client.ts",
    "request/globals.ts"
  ],
  "discord/interactions/types.ts": ["discord/interactions/views.ts"],
  "discord/interactions/view_helpers.ts": [
    "discord/interactions/respond.ts",
    "discord/interactions/types.ts",
    "discord/interactions/views.ts",
    "discord/rest/discord_client.ts",
    "request/globals.ts"
  ],
  "discord/interactions/views.ts": [
    "discord/interactions/types.ts",
    "discord/interactions/view_helpers.ts"
  ],
  "discord/rest/bot_client_helpers.ts": ["discord/rest/discord_client.ts", "request/globals.ts"],
  "discord/rest/discord_client.ts": ["discord/rest/bot_client_helpers.ts", "request/globals.ts"],
  "main/app.ts": [
    "database/client.ts",
    "discord/interactions/types.ts",
    "discord/rest/discord_client.ts",
    "main/commands/all_views.ts",
    "request/globals.ts"
  ],
  "main/commands/all_views.ts": [
    "discord/interactions/respond.ts",
    "discord/interactions/types.ts",
    "main/app.ts",
    "main/commands/help.ts",
    "main/commands/leaderboards/leaderboards_command.ts",
    "main/commands/ping.ts",
    "main/commands/points.ts",
    "main/commands/queue.ts",
    "main/commands/restore.ts",
    "main/commands/settings.ts",
    "main/commands/start_match.ts",
    "main/commands/test_cmd.ts",
    "request/globals.ts"
  ],
  "main/commands/help.ts": [
    "discord/interactions/views.ts",
    "main/app.ts",
    "main/ui/message_pieces.ts"
  ],
  "main/commands/leaderboards/leaderboards_command.ts": [
    "discord/interactions/views.ts",
    "main/app.ts",
    "main/commands/leaderboards/pages.ts"
  ],
  "main/commands/leaderboards/pages.ts": [
    "discord/interactions/types.ts",
    "discord/interactions/views.ts",
    "main/app.ts",
    "main/commands/leaderboards/leaderboards_command.ts",
    "main/guilds.ts",
    "main/leaderboards.ts",
    "main/ui/message_pieces.ts",
    "request/globals.ts"
  ],
  "main/commands/ping.ts": ["discord/interactions/views.ts", "main/app.ts"],
  "main/commands/points.ts": [
    "discord/interactions/views.ts",
    "main/app.ts",
    "main/guilds.ts",
    "main/leaderboards.ts"
  ],
  "main/commands/queue.ts": [
    "discord/interactions/types.ts",
    "discord/interactions/views.ts",
    "main/app.ts",
    "main/queue.ts"
  ],
  "main/commands/restore.ts": [
    "discord/interactions/views.ts",
    "main/app.ts",
    "main/guilds.ts",
    "main/leaderboards.ts"
  ],
  "main/commands/settings.ts": ["discord/interactions/views.ts", "main/app.ts", "main/guilds.ts"],
  "main/commands/start_match.ts": ["discord/interactions/views.ts", "main/app.ts"],
  "main/commands/test_cmd.ts": ["discord/interactions/views.ts", "main/app.ts"],
  "main/guilds.ts": ["database/models/all.ts", "main/app.ts", "main/ui/message_pieces.ts"],
  "main/leaderboards.ts": [
    "database/client.ts",
    "database/models/all.ts",
    "discord/rest/discord_client.ts",
    "main/app.ts",
    "main/commands/queue.ts",
    "main/guilds.ts",
    "main/ui/message_pieces.ts",
    "request/globals.ts"
  ],
  "main/queue.ts": [
    "database/client.ts",
    "database/models/all.ts",
    "main/app.ts",
    "main/leaderboards.ts"
  ],
  "main/ui/message_pieces.ts": [
    "discord/rest/bot_client_helpers.ts",
    "discord/rest/discord_client.ts",
    "main/app.ts"
  ],
  "request/globals.ts": ["request/sentry.ts"],
  "request/sentry.ts": ["request/globals.ts"]
};

        // Create nodes and edges arrays
        const nodes = Object.keys(adjacencyList).map(node => ({ id: node, label: node, size: 150}));
        const edges = [];
        Object.keys(adjacencyList).forEach(node => {
            adjacencyList[node].forEach(neighbor => {
                edges.push({ from: node, to: neighbor, length: 200, color: {highlight: '#eed9ff'} });
            });
        });

        // Create a network
        const container = document.getElementById('graph');
        const data = { nodes: nodes, edges: edges };
        var options = {
            width: (window.innerWidth - 25) + "px",
				    height: (window.innerHeight - 75) + "px",
            nodes: 
            {
                color:{
                    background: '#eed9ff',
                }
            }
          };
        const network = new vis.Network(container, data, options);
    </script>
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

	const supportedLanguages = ['python', 'javascript'];

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


	context.subscriptions.push(create_graph_cmd);
	context.subscriptions.push(generate_wiki);

}

exports.activate = activate;
// This method is called when your extension is deactivated
export function deactivate() {}
