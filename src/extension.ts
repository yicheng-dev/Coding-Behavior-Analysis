import * as vscode from 'vscode';
import { doEvaluation } from './evaluation';

class TypedChar {
	typedTime : number;
	val : String;
	constructor(typedTime : number, val : String){
		this.typedTime = typedTime;
		this.val = val;
	}
}

const INTERVAL = 500;
const DELAY_RATE = 10;

var charVec : any = [];
var backSpaceVec : any = [];
var spaceVec : any = [];
export var codingSpeedCpsList : any = [];
export var codingSpeedWpsList : any = [];
export var codingAccuracyList : any = [];


var currentTime = new Date().getTime();
var startTime : any;
var able : number = 0;

let codingSpeedItem: vscode.StatusBarItem;
let accuracyItem : vscode.StatusBarItem;
let editor = vscode.window.activeTextEditor;

// update the coding speed of last 5 seconds every 1 second

function updateStatusBarItem(): void {
	if (currentTime - INTERVAL * DELAY_RATE > 0){
		let codeCharCnt = 0;
		let codeWordCnt = 0;
		for (var i = 0; i <= charVec.length - 1; i ++){
			if (charVec[i].typedTime >= currentTime - INTERVAL * DELAY_RATE){
				codeCharCnt ++;
			}
		}
		for (i = 0; i <= spaceVec.length - 1; i ++){
			if (spaceVec[i].typedTime >= currentTime - INTERVAL * DELAY_RATE){
				codeWordCnt ++;
			}
		}
		let codeSpeedCps = (codeCharCnt * 1000.0 / (INTERVAL * DELAY_RATE));
		let codeSpeedWps = (codeWordCnt * 1000.0 / (INTERVAL * DELAY_RATE));
		codingSpeedItem.text = `Coding Speed: ${codeSpeedCps.toFixed(2)}CPS | ${codeSpeedWps.toFixed(2)}WPS`;
		var codingSpeedCpsListItem = {x: (currentTime - startTime) / 1000.0, y: codeSpeedCps};
		var codingSpeedWpsListItem = {x: (currentTime - startTime) / 1000.0, y: codeSpeedWps};
		codingSpeedCpsList.push(codingSpeedCpsListItem);
		codingSpeedWpsList.push(codingSpeedWpsListItem);
		codingSpeedItem.show();

		let accurateCnt = charVec.length;
		let totalCnt = charVec.length + backSpaceVec.length;
		let accuracy;
		if (totalCnt > 0){
			accuracy = (accurateCnt * 100.0 / totalCnt);
		}
		else{
			accuracy = 0;
		}
		accuracyItem.text = `Accuracy: ${accuracy.toFixed(2)}%`;
		var codingAccuracyListItem = {x: (currentTime - startTime) / 1000.0, y: accuracy};
		codingAccuracyList.push(codingAccuracyListItem);
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
	for (i = spaceVec.length - 1; i >= 0; i --){
		if (spaceVec[i].typedTime < currentTime - DELAY_RATE * INTERVAL){
			spaceVec.splice(i, 1);
		}
	}
}

function timeoutProcess(time : number){
	setTimeout(() => {
		if (able){
			updateStatusBarItem();
		}
		currentTime = new Date().getTime();
		// deleteOldChar();
		if (able){
			timeoutProcess(time);
		}
	}, time);
}

function doDisable(){
	able = 0;
	deactivate();
}

export function activate(context: vscode.ExtensionContext) {
	currentTime = new Date().getTime();
	startTime = currentTime;
	able = 1;
	let disposable = vscode.commands.registerCommand('extension.CBA', () => {
		able = 1;
		codingSpeedItem.show();
		accuracyItem.show();
	});
	let evaluation = vscode.commands.registerCommand('cba.evaluation', () => {
		doEvaluation(context);
	});
	let disable = vscode.commands.registerCommand('cba.disable', () => {
		doDisable();
	});
	codingSpeedItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 200);
	accuracyItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 200);
	context.subscriptions.push(codingSpeedItem);
	context.subscriptions.push(accuracyItem);
	context.subscriptions.push(evaluation);
	context.subscriptions.push(disposable);
	context.subscriptions.push(disable);
	timeoutProcess(INTERVAL);
	vscode.workspace.onDidChangeTextDocument(event => {
		if (able){
			var typedChar = new TypedChar(new Date().getTime(), event.contentChanges[0].text);
			if (typedChar.val === ""){
				backSpaceVec.push(typedChar);
			}
			else if (typedChar.val === " " || typedChar.val === "\n"){
				spaceVec.push(typedChar);
			}
			else{
				charVec.push(typedChar);
			}
		}
	}, null, context.subscriptions);
	
}

export function deactivate() {
	codingSpeedItem.hide();
	accuracyItem.hide();
}