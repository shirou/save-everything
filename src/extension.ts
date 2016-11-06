'use strict';
import * as vscode from 'vscode';

import { Saver } from './saver';

export function activate(context: vscode.ExtensionContext) {
    const saver = new Saver();

    vscode.workspace.onDidSaveTextDocument(document => {
        saver.save(document);
    });
}

export function deactivate() {
}