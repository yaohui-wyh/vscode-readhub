'use strict';

import * as vscode from 'vscode';

export class InstantViewPanel {
    public static currentPanel: InstantViewPanel | undefined;
    private readonly panel: vscode.WebviewPanel;
    public static readonly viewType = 'ReadHub';
    private disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel) {
        this.panel = panel;
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    }

    public static createOrShow(): InstantViewPanel {
        const sideColume = vscode.ViewColumn.Beside;
        if (InstantViewPanel.currentPanel) {
            InstantViewPanel.currentPanel.panel.reveal(sideColume);
        } else {
            const panel = vscode.window.createWebviewPanel(this.viewType, 'ReadHub 预览', sideColume);
            InstantViewPanel.currentPanel = new InstantViewPanel(panel);
        }
        return InstantViewPanel.currentPanel;
    }

    public render(htmlContent: string) {
        this.panel.webview.html = htmlContent;
    }

    public dispose() {
        InstantViewPanel.currentPanel = undefined;
        this.panel.dispose();
        while (this.disposables.length) {
            const x = this.disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}