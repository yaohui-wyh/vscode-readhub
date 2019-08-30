'use strict';

import * as vscode from 'vscode';
import { ReadhubProvider } from './readhubDataProvider';
import { RHCategory } from './models';
import { getInstantView } from './api';
import { InstantViewPanel } from './instantViewPanel';

export function activate() {
    const topicProvider = new ReadhubProvider(RHCategory.TOPIC);
    vscode.window.registerTreeDataProvider('readhubTopicList', topicProvider);

    const newsProvider = new ReadhubProvider(RHCategory.NEWS);
    vscode.window.registerTreeDataProvider('readhubNewsList', newsProvider);

    const techNewsProvider = new ReadhubProvider(RHCategory.TECH_NEWS);
    vscode.window.registerTreeDataProvider('readhubTechNewsList', techNewsProvider);

    const blockchainProvider = new ReadhubProvider(RHCategory.BLOCKCHAIN);
    vscode.window.registerTreeDataProvider('readhubBlockchainList', blockchainProvider);

    vscode.commands.registerCommand('readhub.openItem', event => {
        const { id, source } = event;
        topicProvider.onClick(id, source);
        newsProvider.onClick(id, source);
        techNewsProvider.onClick(id, source);
        blockchainProvider.onClick(id, source);
    });

    vscode.commands.registerCommand('readhub.entry.visit', item => {
        if (item && item.url) {
            vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(item.url));
        }
    });

    vscode.commands.registerCommand('readhub.topic.instantView', item => {
        if (item && item.id) {
            getInstantView(item.id).then(res => {
                if (res.success && res.result) {
                    const content = res.result.content;
                    InstantViewPanel.createOrShow().render(content);
                }
            });
        }
    });

    vscode.commands.registerCommand('readhub.news.loadMore', () => newsProvider.loadMore());
    vscode.commands.registerCommand('readhub.topic.loadMore', () => topicProvider.loadMore());
    vscode.commands.registerCommand('readhub.techNews.loadMore', () => techNewsProvider.loadMore());
    vscode.commands.registerCommand('readhub.blockchain.loadMore', () => blockchainProvider.loadMore());

    vscode.commands.registerCommand('readhub.news.refresh', () => newsProvider.refreshItems(true));
    vscode.commands.registerCommand('readhub.topic.refresh', () => topicProvider.refreshItems(true));
    vscode.commands.registerCommand('readhub.techNews.refresh', () => techNewsProvider.refreshItems(true));
    vscode.commands.registerCommand('readhub.blockchain.refresh', () => blockchainProvider.refreshItems(true));
}