'usr strict'

import * as vscode from 'vscode';

import fs = require('fs');
import path = require('path');

interface ISettings {
    exclude: string[];
    enabled: boolean;
    root: string;
}

export class Saver {
    private mkdirp = require('mkdirp');
    private settings: ISettings;
    private excludes: RegExp[];

    constructor() {
        this.settings = this.readSettings();

        // compile
        this.excludes = new Array(this.settings.exclude.length);
        for (let i = 0; i < this.settings.exclude.length; i++){
            this.excludes[i] = new RegExp(this.settings.exclude[i]);
        }
    }

    public save(document: vscode.TextDocument) {
        if (!this.settings.enabled) {
            return;
        }
        if (!(document && document.fileName)) {
            return;
        }
        /*
        for (let i = 0;i < this.excludes.length; i++){
            if (path.basename(document.fileName).match(this.excludes[i])){
                return;
            }
        }
        */

        // replace Windows drive letter to one character (C: -> C)
        const filename = document.fileName.replace(/(^[c-zC-Z]):/, "$1");

        const f = this.resolve(path.join(
                this.settings.root,
                this.datePath(),
                filename
        ));
        if (this.mkDirRecursive(f)) {
            const text = document.getText();
            fs.writeFile(f, text,
                (err) => {
                    if (err) {
                        vscode.window.showErrorMessage(
                            'Can not save the file: '+document.fileName+
                                        ' Error: '+ err.toString());
                    }
                }
            );
        }
    }

    private readSettings(): ISettings {
        let config = vscode.workspace.getConfiguration('save-everything');

        return {
            root: <string>config.get('root') || '~/.save',
            exclude: <string[]>config.get('exclude') || ["$\."],
            enabled: <boolean>config.get('enabled') || true,
        };
    }

    private mkDirRecursive(fileName: string): boolean {
        try {
            this.mkdirp.sync(path.dirname(fileName));
            return true;
        }
        catch (err) {
            vscode.window.showErrorMessage(
                'Error with mkdirp: '+err.toString()+' file ' + fileName);
            return false;
        }
    }

    private resolve(dirName: string): string {
        const p = dirName.replace("~", this.home());
        return path.normalize(path.resolve(p));
    }

    private home(): string{
        return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    }

    private datePath(): string{
        const now = new Date();
        const year = now.getFullYear() + ""; // to string
        const month = now.getMonth() + 1;
        const monthStr = (month < 10 ? "0" : "") + month;
        const day = now.getDate();
        const dayStr = (day < 10 ? "0" : "") + day;

        return path.join(year, monthStr, dayStr);
    }
}
