import * as vscode from 'vscode';
import { codingSpeedList, codingAccuracyList } from './extension';

export function doEvaluation(context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
        'codingEvaluation',
        'Coding Evaluation',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );
    context.subscriptions.push(panel);

    panel.webview.html = getWebviewContent();
    panel.webview.postMessage(getCodingMessage());
    panel.webview.onDidReceiveMessage(
        message => {
          switch (message.command) {
            case 'alert':
              console.log(message.text);
              return;
          }
        },
        undefined,
        context.subscriptions
      );
}

function getCodingMessage() {
    var speedJson: any = [];
    var accuracyJson: any = [];
    if (codingSpeedList) {
        for (var i = 0; i < codingSpeedList.length; i++) {
            speedJson.push(codingSpeedList[i]);
        }
    }
    if (codingAccuracyList) {
        for (i = 0; i < codingAccuracyList.length; i++) {
            accuracyJson.push(codingAccuracyList[i]);
        }
    }
    var json: any = [];
    json.push({ id: 0, content: speedJson });
    json.push({ id: 1, content: accuracyJson });
    return json;
}

function getWebviewContent() {
    return `<!DOCTYPE HTML>
    <html>
    <head>
    <canvas id="myChart" style="height: 300px; width: 100%;"></canvas>
    <script>
    var speedJson;
    var accuracyJson;
    var xlabels = [];
    var ylabels = [];
    window.addEventListener('message', event => {
        const message = event.data;
        speedJson = message[0].content;
        accuracyJson = message[1].content;
    });
    window.onload = function () {
        for (var i = 0; i < speedJson.length; i ++){
            xlabels.push(speedJson[i].x.toString());
            ylabels.push(speedJson[i].y);
        }
        var data = {
            labels: xlabels,
            datasets: [{
                data: ylabels
            }]
        };
        var ctx = document.getElementById("myChart").getContext("2d");
        var MyNewChart = new Chart(ctx).Line(data);
    }
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/1.0.2/Chart.min.js"></script>
    </head>
    <body>
    </body>
    </html>`;
}

