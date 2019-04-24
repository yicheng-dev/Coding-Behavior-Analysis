import * as vscode from 'vscode';
import { codingSpeedCpsList, codingAccuracyList, codingSpeedWpsList, charHashTable } from './extension';

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
}

function debugPrintCharHashTable(){
    for (var key in charHashTable){
        console.log(key + ": " + charHashTable[key]);
    }
}

function getCodingMessage() {
    var speedJsonCps: any = [];
    var speedJsonWps: any = [];
    var accuracyJson: any = [];
    var charJson: any = [];
    // debugPrintCharHashTable();
    if (codingSpeedCpsList) {
        for (var i = 0; i < codingSpeedCpsList.length; i++) {
            speedJsonCps.push(codingSpeedCpsList[i]);
        }
    }
    if (codingAccuracyList) {
        for (i = 0; i < codingAccuracyList.length; i++) {
            accuracyJson.push(codingAccuracyList[i]);
        }
    }
    if (codingSpeedWpsList){
        for (i = 0; i < codingSpeedWpsList.length; i++){
            speedJsonWps.push(codingSpeedWpsList[i]);
        }
    }
    if (charHashTable){
        for (var key in charHashTable){
            charJson.push({x: key, y: charHashTable[key]});
        }
    }
    var json: any = [];
    json.push({ id: 0, content: speedJsonCps });
    json.push({ id: 1, content: speedJsonWps });
    json.push({ id: 2, content: accuracyJson });
    json.push({ id: 3, content: charJson     });
    return json;
}

function getWebviewContent() {
    return `<!DOCTYPE HTML>
    <html>
    <head>
    <script>
    var speedJsonCps;
    var speedJsonWps;
    var accuracyJson;
    var charJson;
    var xlabels = [];
    var ylabelsCps = [];
    var ylabelsWps = [];
    var ylabelsAcc = [];
    var charlabels = [];
    var charCountlabels = [];
    window.addEventListener('message', event => {
        const message = event.data;
        speedJsonCps = message[0].content;
        speedJsonWps = message[1].content;
        accuracyJson = message[2].content;
        charJson = message[3].content;
    });
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.8.0/Chart.min.js"></script>
    <script>
    window.onload = function () {
        for (var i = 0; i < speedJsonCps.length; i ++){
            xlabels.push(speedJsonCps[i].x.toString());
            ylabelsCps.push(speedJsonCps[i].y);
        }
        for (i = 0; i < speedJsonWps.length; i ++){
            ylabelsWps.push(speedJsonWps[i].y);
        }
        for (i = 0; i < speedJsonWps.length; i ++){
            ylabelsAcc.push(accuracyJson[i].y);
        }
        for (i = 0; i < charJson.length; i ++){
            charlabels.push(charJson[i].x);
            charCountlabels.push(charJson[i].y);
        }
        var data = {
            labels: xlabels,
            datasets: [{
                label: 'Coding Speed (Char/s)',
                data: ylabelsCps
            }, {
                label: 'Coding Speed (Word/s)',
                data: ylabelsWps
            }]
        };
        var options = {
            title: {
                display: true,
                text: 'Change of Coding Speed',
                position: 'bottom'
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Time (s)'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Coding Speed'
                    }
                }]
            }
        };
        var ctx = document.getElementById("speedChart").getContext("2d");
        var speedChart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: options
        });
        data = {
            labels: xlabels,
            datasets: [{
                label: 'Accuracy (%)',
                data: ylabelsAcc
            }]
        };
        options = {
            title: {
                display: true,
                text: 'Change of Coding Accuracy',
                position: 'bottom'
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Time (s)'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Accuracy (%)'
                    }
                }]
            }
        };
        ctx = document.getElementById("accuracyChart").getContext("2d");
        var accuracyChart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: options
        });

        data = {
            datasets: [{
                fill: true,
                data: charCountlabels
            }],
            labels: charlabels
        };
        options = {
            title: {
                display: true,
                text: 'Frequency of Typed characters',
                position: 'top'
            },
            legend: {
                display: true,
                position: 'bottom'
            }
        };
        ctx = document.getElementById("charFreqChart").getContext("2d");
        var charFreqChart = new Chart(ctx, {
            type: 'pie',
            data: data,
            options: options
        });
    }
    </script>
    <title> Evaluation of Coding Behavior </title>
    </head>
    <body>
    <h1>Evaluation of Coding Behavior</h1>
    <canvas id="speedChart" style="height: 300px; width: 100%;"></canvas>
    <HR style= " border: 1 dashed #987cb9" width ="100%" cb 9 SIZE = 1>
    <canvas id="accuracyChart" style="height: 300px; width: 100%;"></canvas>
    <HR style= " border: 1 dashed #987cb9" width ="100%" cb 9 SIZE = 1>
    <canvas id="charFreqChart" style="height: 300px; width: 100%;"></canvas>
    <HR style= " border: 1 dashed #987cb9" width ="100%" cb 9 SIZE = 1>
    </body>
    </html>`;
}