import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "smart-stylus-sorter" is now active!');

	let disposable = vscode.commands.registerCommand('smart-stylus-sorter.smartSort', () => {
		smartSort();
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }

const smartSort = () => {
	const inputLines = getDocumentLines();
	const outputLines = sortLines(inputLines);
	ReplaceDocumentWith(outputLines)
}

const getDocumentLines = () => {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return [];
	}

	const document = editor.document;
	const lines = [];
	for (let i = 0; i < document.lineCount; i++) {
		const line = document.lineAt(i);
		lines.push(line.text);
	}

	if (lines[lines.length - 1] !== '') {
		lines.push('');
	}

	return lines;
}

const ReplaceDocumentWith = (lines: string[]) => {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return;
	}

	const document = editor.document;
	const edit = new vscode.WorkspaceEdit();

	// Remove the extra empty line before replacing the document
	if (lines[lines.length - 1] === '') {
		lines.pop();
	}

	for (let i = 0; i < lines.length; i++) {
		const line = document.lineAt(i);
		console.log({ line });
		const text = lines[i] || '';
		edit.replace(
			document.uri,
			new vscode.Range(i, 0, i, line.range.end.character),
			text
		);
	}

	vscode.workspace.applyEdit(edit);
	vscode.window.showInformationMessage('Stylus file sorted!');
}

const sortLines = (lines: string[]) => {
	const sortedLines: string[] = [];
	const selectorsPrefixes = [".", "&", "button"];

	let blockToSort: string[] = [];
	for (const line of lines) {
		if (!startsWith(line, selectorsPrefixes)) {
			blockToSort.push(line);
		}
		else {
			blockToSort = blockToSort.sort();
			sortedLines.push(...blockToSort);
			sortedLines.push(line);
			blockToSort = [];
		}
	}

	return sortedLines;
}

const startsWith = (line: string, prefixes: string[]) => {
	for (const prefix of prefixes) {
		if (line.replace(/^\s+/g, '').startsWith(prefix) || line.length === 0) {
			return true;
		}
	}

	return false;
}