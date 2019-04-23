import * as vscode from 'vscode';

class TypedChar {
	typedTime : number;
	val : String;
	constructor(typedTime : number, val : String){
		this.typedTime = typedTime;
		this.val = val;
	}
}

const INTERVAL = 300;
const DELAY_RATE = 10;

var charVec : any = [];
var backSpaceVec : any = [];

var currentTime = new Date().getTime();

let codingSpeedItem: vscode.StatusBarItem;
let accuracyItem : vscode.StatusBarItem;
let editor = vscode.window.activeTextEditor;

// update the coding speed of last 5 seconds every 1 second

function updateStatusBarItem(): void {
	if (currentTime - INTERVAL * DELAY_RATE > 0){
		let codeCharCnt = 0;
		for (var i = 0; i <= charVec.length - 1; i ++){
			if (charVec[i].typedTime >= currentTime - INTERVAL * DELAY_RATE){
				codeCharCnt ++;
			}
		}
		let codeSpeed = (codeCharCnt * 1000.0 / (INTERVAL * DELAY_RATE)).toFixed(2);
		codingSpeedItem.text = `Coding Speed: ${codeSpeed}WPS`;
		codingSpeedItem.show();

		let accurateCnt = charVec.length;
		let totalCnt = charVec.length + backSpaceVec.length;
		let accuracy = (accurateCnt * 100.0 / totalCnt).toFixed(2);
		accuracyItem.text = `Accuracy: ${accuracy}%`;
		accuracyItem.show();
	}
	else{
		codingSpeedItem.hide();
	}
}

function backspaceProcess() : void {
	var backspace = new TypedChar(new Date().getTime(), "");
	backSpaceVec.push(backspace);
}

function deleteOldChar(): void{
	for (var i = charVec.length - 1; i >= 0; i --){
		if (charVec[i].typedTime < currentTime - DELAY_RATE * INTERVAL){
			charVec.splice(i, 1);
		}
	}
	for (i = backSpaceVec.length - 1; i >= 0; i --){
		if (backSpaceVec[i].typedTime < currentTime - DELAY_RATE * INTERVAL){
			backSpaceVec.splice(i, 1);
		}
	}
}

function timeoutProcess(time : number){
	setTimeout(() => {
		currentTime = new Date().getTime();
		// deleteOldChar();
		updateStatusBarItem();
		timeoutProcess(time);
	}, time);
}

export function activate(context: vscode.ExtensionContext) {
	currentTime = new Date().getTime();
	let disposable = vscode.commands.registerCommand('extension.CBA', () => {});
	codingSpeedItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 200);
	accuracyItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 200);
	context.subscriptions.push(codingSpeedItem);
	context.subscriptions.push(accuracyItem);
	timeoutProcess(INTERVAL);
	// context.subscriptions.push(backspaceProc);
	context.subscriptions.push(disposable);
	vscode.workspace.onDidChangeTextDocument(event => {
		var typedChar = new TypedChar(new Date().getTime(), event.contentChanges[0].text);
		if (typedChar.val === ""){
			backSpaceVec.push(typedChar);
		}
		else{
			charVec.push(typedChar);
		}
	}, null, context.subscriptions);
	
}

export function deactivate() {}