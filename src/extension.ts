'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import fs = require('fs');
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "line-counter" is now active!');

    let channel = vscode.window.createOutputChannel("Line Counter");
    
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let countFileCommand = vscode.commands.registerCommand('extension.count-file', () => {
        let editor = vscode.window.activeTextEditor;
        let document = editor.document;
        let lineCount = document.lineCount;
        channel.show();
        channel.appendLine(document.fileName + "'s line count: " + lineCount.toString());
    });

    let countWorkspaceCommand = vscode.commands.registerCommand('extension.count-workspace', () => {
        let rootPath = vscode.workspace.rootPath;
        console.log(rootPath);
        if (rootPath) {
            let lineCount = 0;
            let cfg = vscode.workspace.getConfiguration("line-counter");
            let includesCfg = cfg.get<string[]>('includes');
            let includes = `{${includesCfg.join(',')}}`;
            let excludesCfg = cfg.get<string[]>("excludes");
            let excludes = `{${excludesCfg.join(',')}}`;

            vscode.workspace.findFiles(includes, excludes, 0).then(value => {
                let count = value.length;
                console.log('count' + count);
                for (let _i = 0; _i < value.length; _i++) {
                    let file = value[_i];      
                    console.log('counting ' + file.path + "...");              
                    let content = fs.readFileSync(file.fsPath, 'utf-8');
                    lineCount += content.split('\n').length;
                }
                channel.show();
                channel.appendLine('Workspace total line count is ' + lineCount.toLocaleString());
            });
           
        } else {
            channel.show();
            channel.appendLine('no workspace, countting cancled...');
        }

    });
    
    context.subscriptions.push(countFileCommand);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
