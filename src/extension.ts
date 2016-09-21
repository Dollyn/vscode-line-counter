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
        // The code you place here will be executed every time your command is executed
        
        // Display a message box to the user
        // vscode.window.showInformationMessage('Hello World!');
        let editor = vscode.window.activeTextEditor;
        let document = editor.document;
        let lineCount = document.lineCount;
        channel.show();
        channel.appendLine(document.fileName + "'s line count: " + lineCount.toString());
    });

    let countWorkspaceCommand = vscode.commands.registerCommand('extension.count-workspace', () => {
        let rootPath = vscode.workspace.rootPath;
         
        if (rootPath) {
            let lineCount = 0;
            vscode.workspace.findFiles("*.*", ".vscode/*", 0).then(value => {
                let count = value.length;
                
                for (let _i = 0; _i < value.length; _i++) {
                    let file = value[_i];
                    vscode.workspace.openTextDocument(file).then(doc => {
                        lineCount += doc.lineCount;
                        count--;
                        if (count == 0) {
                            channel.show();
                            channel.appendLine("Workspace's total line count: " + lineCount);    
                        }
                    });  
                }
        
            });
           
        } else {
            channel.show();
            channel.append('no workspace, countting cancled...');
        }

    });
    
    context.subscriptions.push(countFileCommand);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
