# line-counter README

## Features

This is a plugin that counts the number of lines of code. Users can use the following two commands to count the current file or the entire workspace's code line:

- Count current file
- Count workspace

Count workspace now support huge files (may take some long time, for 27G+ text file it takes about 5min). For some reason, Count current file can't run on huge file.

You can also customize the inclusion or omission of certain files by following the configuration: 

```
    "line-counter.excludes": [
        "**/.vscode/**",
        "**/vendor/**"
    ],
    "line-counter.includes": [
        "**/*"
    ]
```
(Don't hate me for the chinglish, hate google translate ^_^)

![feature X](https://github.com/Dollyn/vscode-line-counter/raw/master/images/overview.gif)
