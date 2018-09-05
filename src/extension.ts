'use strict';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import fs = require('fs');
import readline = require('readline')
import stream = require('stream')
import * as vscode from 'vscode';
import { resolve } from 'path';

const ruleMap = new Map<string, vscode.CommentRule>();

let cLikeRule = {
    lineComment: "//",
    blockComment: ["/*", "*/"] as vscode.CharacterPair
};

let sqlRule = {
    lineComment: "#"
}

ruleMap.set("js", cLikeRule);
ruleMap.set("java", cLikeRule);
ruleMap.set("kt", cLikeRule);
ruleMap.set("go", cLikeRule);
ruleMap.set("ts", cLikeRule);
ruleMap.set("sql", sqlRule)


let channel;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "line-counter" is now active!');

    channel = vscode.window.createOutputChannel("Line Counter");
    
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let countFileCommand = vscode.commands.registerCommand('extension.count-file', () => {
        console.log('count cuffrent')
        let editor = vscode.window.activeTextEditor;
        console.log(editor)
        let document = editor.document;
        console.log(document.fileName)
        console.log(document.uri)
        let lineCount = document.lineCount;
        channel.show();
        channel.appendLine(document.fileName + "'s line count: " + lineCount.toString());
    });

    let countWorkspaceCommand = vscode.commands.registerCommand('extension.count-workspace', () => {
        let rootPath = vscode.workspace.rootPath;
        console.log(rootPath);
        channel.show();
        channel.appendLine('Start counting... ');
        let start = Date.now();
        console.time("count");

        if (rootPath) {
            let lineCount = 0;
            let comments = 0;
            let blank = 0;

            let cfg = vscode.workspace.getConfiguration("line-counter");
            let includesCfg = cfg.get<string[]>('includes');
            let includes = `{${includesCfg.join(',')}}`;
            let excludesCfg = cfg.get<string[]>("excludes");
            let excludes = `{${excludesCfg.join(',')}}`;

            let res: LineCount = {all: 0, comment: 0, blank: 0};
            let counter = Promise.resolve(res)

            vscode.workspace.findFiles(includes, excludes, 0).then(value => {
                console.log(`counting ${value} ...`);
                for (let _i = 0; _i < value.length; _i++) {
                    let file = value[_i];      
                    counter = counter.then(res => {
                        return count(file.fsPath, res)
                    })             
                }
                counter.then(result => {
                    channel.show();
                    let end = Date.now();
                    let time = end - start;
                    channel.appendLine(`Countting took ${time} ms. The result is: `);
                    channel.appendLine(`    total:\t${result.all.toLocaleString()}`);
                    channel.appendLine(`    code:\t${(result.all - result.comment - result.blank).toLocaleString()}`);
                    channel.appendLine(`    comment:\t${result.comment.toLocaleString()}`);
                    channel.appendLine(`    blank:\t${result.blank.toLocaleString()}`);
                    console.timeEnd("count");
                })                               
            });           
        } else {
            channel.show();
            channel.appendLine('no workspace, counting canceled...');
        }
    });
    
    context.subscriptions.push(countFileCommand);
} 


// this method is called when your extension is deactivated
export function deactivate() {
}

interface LineCount {
    all: number;
    comment: number;
    blank: number;
}

function count(path: string, countObj: LineCount): Promise<LineCount> {
    console.log(`counting ${path}`)
    return new Promise((resolve, reject) => {
        let ext = getExt(path);
        let commentRule = ruleMap.get(ext);
        let result: LineCount = {all: 0, comment: 0, blank: 0};
    
        var instream = fs.createReadStream(path);
        var rl = readline.createInterface({
            input: instream
        })
    
        let blockComment = false;
        let outputChunk = 0;
        rl.on('line', function(line){
            let trimed = line.trim();
            result.all++;
            outputChunk++;
            if (outputChunk == 100_000_000) {
                channel.appendLine(`still counting ${path}, current line: ${result.all.toLocaleString()}`)
                outputChunk = 0;
            }
            if (trimed.length == 0) {
                result.blank++;
                if (blockComment) {
                    result.comment++;
                }
            } else if (commentRule) {
                if (trimed.startsWith(commentRule.lineComment)) {
                    result.comment++;
                } else {
                    if (commentRule.blockComment) {
                        if (blockComment) {
                            result.comment++;
                            // end of block comment?
                            if (line.indexOf(commentRule.blockComment[1]) >= 0) {
                                blockComment = false;
                            }
                        } else {
                            if (line.indexOf(commentRule.blockComment[0]) >= 0) {
                                blockComment = true;
                                result.comment++;
                                if (line.indexOf(commentRule.blockComment[1]) >= 0) {
                                    blockComment = false;
                                }
                            }
                        }
                    }
                }
            } 
        })
        rl.on('close', () => {
            countObj.all += result.all
            countObj.blank += result.blank
            countObj.comment += result.comment
            if (result.all >= 100000000) {
                channel.appendLine(`counting ${path} finished.`)
            }
            resolve(countObj)
        })
    });
}

function getExt(path: string) {
    let i = path.lastIndexOf(".");
    if (i >= 0) {
        return path.substring(i+1);
    }
    return "";
}

