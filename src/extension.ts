// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { AxiosError } from 'axios';
import { error } from 'console';
import * as vscode from 'vscode';
import CodexClient from './serivces/codex';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let model = vscode.workspace.getConfiguration("codex").get("model") as string;
	let apiKey = vscode.workspace.getConfiguration("codex").get("apikey") as string;
	let maxToken = vscode.workspace.getConfiguration("codex").get("maxToken") as number;
	let timeout = vscode.workspace.getConfiguration("codex").get("timeout") as number;
	let client = new CodexClient(model, apiKey,maxToken, timeout);

	if (apiKey === "") {
		vscode.window.showErrorMessage("请在设置中配置您的openai apikey");
	}

	let complete = vscode.commands.registerCommand('codex.complete', async () => {
		let editor = vscode.window.activeTextEditor;
		if (!editor) {
			return; // No open text editor
		}
		let selection = editor.selection;
		let text = editor.document.getText(selection);//选择文本
		try {
			let result = await client.requestCodeComplete(text, editor.document.languageId);
			editor.edit((builder) => {
				builder.insert(selection.end, result);
			});
		} catch (error: any) {
			await vscode.window.showErrorMessage(error.toString());
		}
	});

	let explain = vscode.commands.registerCommand('codex.explain', async () => {
		let editor = vscode.window.activeTextEditor;
		if (!editor) {
			return; // No open text editor
		}
		let selection = editor.selection;
		let text = editor.document.getText(selection);//选择文本
		try {
			let result = await client.requestCodeExplain(text);
			editor.edit((builder) => {
				builder.insert(selection.end, "\n" + result);
			});
		} catch (error: any) {
			await vscode.window.showErrorMessage(error.toString());
		}
	});

	let common = vscode.commands.registerCommand('codex.common', async () => {
		let editor = vscode.window.activeTextEditor;
		if (!editor) {
			return; // No open text editor
		}
		let selection = editor.selection;
		let text = editor.document.getText(selection);//选择文本
		try {
			let result = await client.general(text);
			editor.edit((builder) => {
				builder.insert(selection.end, "\n" + result);
			});
		} catch (error: any) {
			await vscode.window.showErrorMessage(error.toString());
		}
	});

	context.subscriptions.push(complete, explain, common);
}

// This method is called when your extension is deactivated
export function deactivate() { }
