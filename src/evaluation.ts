import * as vscode from 'vscode';
import { codingSpeedList, codingAccuracyList } from './extension';

export function doEvaluation(context: vscode.ExtensionContext){
    const panel = vscode.window.createWebviewPanel(
        'codingEvaluation',
        'Coding Evaluation',
        vscode.ViewColumn.One,
        {enableScripts : true}
    );
    context.subscriptions.push(panel);

    panel.webview.html = getWebviewContent();
    panel.webview.postMessage(getCodingMessage());
}

function getCodingMessage(){
    var speedJson : any = [];
    var accuracyJson : any = [];
    for (var i = 0; i < codingSpeedList.length; i ++){
        speedJson.push(codingSpeedList[i]);
    }
    for (i = 0; i < codingAccuracyList.length; i ++){
        accuracyJson.push(codingAccuracyList[i]);
    }
    var json : any = [];
    json.push({id: 0, content: speedJson});
    json.push({id: 1, content: accuracyJson});
    return json;
}

function getWebviewContent(){
    return `<!DOCTYPE HTML>
    <html>
    <head>  
    <script>
    var speedJson;
    var accuracyJson;
    window.addEventListener('message', event => {
        const message = event.data;
        speedJson = message[0].content;
        accuracyJson = message[1].content;
    });
    window.onload = function () {
    var chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        theme: "light2",
        title:{
            text: "Coding Speed"
        },
        axisX:{
            title: "Time (s)"
        },
        axisY:{
            title: "Coding Speed (Char/s)",
            includeZero: false
        },
        data: [{        
            type: "line",       
            dataPoints: speedJson
        }]
    });
    chart.render();
    }
    </script>
    </head>
    <body>
        <div id="chartContainer" style="height: 300px; width: 100%;"></div>
    </body>
    <script src="https://canvasjs.com/assets/script/canvasjs.min.js"></script>
    </html>`;
}

