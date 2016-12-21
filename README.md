# line-counter README

## Features

This is the first version of line-counter plugin. It countributes 2 commands to count the LOC of current opened file and the whole workspace:

- Count current file
- Count workspace

You can custom the includes/excludes file pattern: 

```
    "line-counter.excludes": [
        "**/.vscode/**",
        "**/vendor/**"
    ],
    "line-counter.includes": [
        "**/*"
    ]
```


![feature X](https://github.com/Dollyn/vscode-line-counter/raw/master/images/overview.gif)

## Release Notes

### 0.2.0
Can now count comments and blank lines separately for c-like grammar(java,js,ts,go). 

### 0.1.0
Support includes/excludes counfiguration.
