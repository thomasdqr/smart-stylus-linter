import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "smart-stylus-linter" is now active!');

	let disposable = vscode.commands.registerCommand('smart-stylus-linter.smartLint', () => {
		smartLint();
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }

const smartLint = () => {
	const inputLines = getDocumentLines();
	const outputLines = sortLines(inputLines);
	replaceDocumentWith(outputLines);
};

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
};

const replaceDocumentWith = (lines: string[]) => {
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
		const text = lines[i] || '';
		edit.replace(
			document.uri,
			new vscode.Range(i, 0, i, line.range.end.character),
			text
		);
	}

	vscode.workspace.applyEdit(edit);
	vscode.window.showInformationMessage('Stylus file successfully linted!');
};

const sortLines = (lines: string[]) => {
	const sortedLines: string[] = [];

	let blockToSort: string[] = [];
	for (const line of lines) {
		if (!isSelector(line)) {
			blockToSort.push(line.replace(':', '').replace(';', ''));
		}
		else {
			blockToSort = blockToSort.sort();
			sortedLines.push(...blockToSort);
			sortedLines.push(line);
			blockToSort = [];
		}
	}

	return sortedLines;
};

const startsWith = (line: string, prefixes: string[]) => {
	for (const prefix of prefixes) {
		const lineWithoutSpaces = line.replace(/^\s+/g, '');
		if (lineWithoutSpaces.startsWith(prefix) || line.length === 0) {
			return true;
		}
	}

	return false;
};

const isSelector = (line: string) => {
	const htmlTagSelectors = [
		"a",
		"abbr",
		"address",
		"article",
		"aside",
		"audio",
		"b",
		"blockquote",
		"body",
		"button",
		"canvas",
		"caption",
		"cite",
		"code",
		"col",
		"colgroup",
		"datalist",
		"dd",
		"del",
		"details",
		"dfn",
		"div",
		"dl",
		"dt",
		"em",
		"fieldset",
		"figcaption",
		"figure",
		"footer",
		"form",
		"h1",
		"h2",
		"h3",
		"h4",
		"h5",
		"h6",
		"header",
		"hr",
		"i",
		"iframe",
		"img",
		"input",
		"ins",
		"kbd",
		"label",
		"legend",
		"li",
		"main",
		"map",
		"mark",
		"menu",
		"menuitem",
		"meter",
		"nav",
		"ol",
		"optgroup",
		"option",
		"output",
		"p",
		"pre",
		"progress",
		"q",
		"s",
		"samp",
		"section",
		"select",
		"small",
		"span",
		"strong",
		"sub",
		"summary",
		"sup",
		"table",
		"tbody",
		"td",
		"textarea",
		"tfoot",
		"th",
		"thead",
		"time",
		"tr",
		"u",
		"ul",
		"var",
		"video",
	];
	const pseudoSelectors = [".", "&", "#", ":"];
	const selectorsPrefixes = [...htmlTagSelectors, ...pseudoSelectors];

	const lineWithoutSpaces = line.replace(/^\s+/g, '');
	let isSelector = false;
	if (startsWith(lineWithoutSpaces, pseudoSelectors)) {
		isSelector = true;
	}
	else if (startsWith(lineWithoutSpaces, selectorsPrefixes)) {
		for(const selector of selectorsPrefixes) {
			const lineWitoutSelector = lineWithoutSpaces.replace(selector, '');
			if (startsWith(lineWitoutSelector, pseudoSelectors)) {
				isSelector = true;
				break;
			}
		}
	}

	return isSelector;
};