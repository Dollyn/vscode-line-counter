'use strict';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import fs = require('fs');
import * as vscode from 'vscode';

interface RegExpConstructor {
    [Symbol.species](): RegExpConstructor;
}

interface Map<K, V> {
    clear(): void;
    delete(key: K): boolean;
    entries(): IterableIterator<[K, V]>;
    forEach(callbackfn: (value: V, index: K, map: Map<K, V>) => void, thisArg?: any): void;
    get(key: K): V;
    has(key: K): boolean;
    keys(): IterableIterator<K>;
    set(key: K, value?: V): Map<K, V>;
    size: number;
    values(): IterableIterator<V>;
    [Symbol.iterator]():IterableIterator<[K,V]>;
    [Symbol.toStringTag]: string;
}

interface MapConstructor {
    new (): Map<any, any>;
    new <K, V>(): Map<K, V>;
    new <K, V>(iterable: Iterable<[K, V]>): Map<K, V>;
    prototype: Map<any, any>;
}
declare var Map: MapConstructor;

const ruleMap = new Map<string, vscode.CommentRule>();

let cLikeRule = {
    lineComment: "//",
    blockComment: ["/*", "*/"] as vscode.CharacterPair
};

ruleMap.set("js", cLikeRule);
ruleMap.set("java", cLikeRule);
ruleMap.set("go", cLikeRule);
ruleMap.set("ts", cLikeRule);


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
            let comments = 0;
            let blank = 0;

            let cfg = vscode.workspace.getConfiguration("line-counter");
            let includesCfg = cfg.get<string[]>('includes');
            let includes = `{${includesCfg.join(',')}}`;
            let excludesCfg = cfg.get<string[]>("excludes");
            let excludes = `{${excludesCfg.join(',')}}`;

            vscode.workspace.findFiles(includes, excludes, 0).then(value => {
                let result: LineCount = {all: 0, commnet: 0, blank: 0};
                console.log(`countting ${value} ...`);
                for (let _i = 0; _i < value.length; _i++) {
                    let file = value[_i];      
                    console.log('counting ' + file.path + "...");       
                    let resultOfFile = doCount(file.fsPath);       
                    result.all += resultOfFile.all;
                    result.commnet += resultOfFile.commnet;
                    result.blank += resultOfFile.blank;             
                }
                channel.show();
                channel.appendLine('Workspace total line count is: ');
                channel.appendLine(`    total: ${result.all}`);
                channel.appendLine(`    comment: ${result.commnet}`);
                channel.appendLine(`    blank: ${result.blank}`);
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

interface LineCount {
    all: number;
    commnet: number;
    blank: number;
}

export function doCount(path: string) {
    let ext = getExt(path);
    let commentRule = ruleMap.get(ext);
    let result: LineCount = {all: 0, commnet: 0, blank: 0};

    let content = fs.readFileSync(path, 'utf-8');
    
    let blockComment = false;
    content.split('\n').forEach(line => {
        let trimed = line.trim();
        result.all++;
        if (trimed.length == 0) {
            result.blank++;
            if (blockComment) {
                result.commnet++;
            }
        } else if (commentRule) {
            if (trimed.startsWith(commentRule.lineComment)) {
                result.commnet++;
            } else {
                if (commentRule.blockComment) {
                    if (blockComment) {
                        result.commnet++;
                        // end of block comment?
                        if (line.indexOf(commentRule.blockComment[1]) >= 0) {
                            blockComment = false;
                        }
                    } else {
                        if (line.indexOf(commentRule.blockComment[0]) >= 0) {
                            blockComment = true;
                            result.commnet++;
                            if (line.indexOf(commentRule.blockComment[1]) >= 0) {
                                blockComment = false;
                            }
                        }
                        
                    }
                }
            }
        }
    });

    return result;
}

function getExt(path: string) {
    let i = path.lastIndexOf(".");
    if (i >= 0) {
        return path.substring(i+1);
    }
    return "";
}

