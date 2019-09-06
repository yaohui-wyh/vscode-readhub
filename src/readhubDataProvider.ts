import * as vscode from 'vscode';
import { getLatestItems, fetchPrevItems } from './api';
import { RHTreeItem, RHCategory, RHNews, RHTopic } from './models';
import { getOutputChannel, ReadhubConfig, getTimeDelta } from './utils';

export class ReadhubProvider implements vscode.TreeDataProvider<RHTreeItem> {

    private _onDidChangeTreeData = new vscode.EventEmitter<RHTreeItem | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
    private itemList: Array<RHTreeItem> = [];

    constructor(private category: RHCategory) {
        this.refreshItems();
    }

    public loadMore() {
        const idx = this.itemList.length - 1;
        if (idx > 0) {
            const lastItem = this.itemList[idx];
            fetchPrevItems<RHTreeItem>(this.category, lastItem).then(ret => {
                if (ret.success && ret.result) {
                    this.itemList = this.parseResult(ret.result);
                    this.refresh();
                    ReadhubConfig.showNotification('ReadHub 资讯已更新');
                } else {
                    ReadhubConfig.showErrorMessage('更新 ReadHub 资讯失败');
                }
            });
        }
    }

    public onClick(id: string, source: string) {
        if (source !== this.category.nameKey) {
            return;
        }
        const item = id && this.itemList.find(i => i.id === id) || undefined;
        if (item) {
            getOutputChannel().clear();
            getOutputChannel().appendLine(`${item.title}  [${getTimeDelta(item.publishDate)}]`);
            getOutputChannel().appendLine('');
            getOutputChannel().appendLine(item.summary);
            getOutputChannel().show(true);
        }
    }

    private parseResult(result: Array<RHTreeItem>): Array<RHTreeItem> {
        return [...this.itemList, ...result.map(i => {
            let item = new RHTreeItem(i.title, this.category, {
                command: 'readhub.openItem',
                title: '',
                arguments: [{ id: i.id, source: this.category.nameKey }]
            });
            Object.assign(item, i);
            if (i.hasInstantView) {
                item.contextValue = 'readhubInstantView';
            }
            return item;
        })].filter((obj, idx, arr) => {
            return arr.map(i => i.id).indexOf(obj.id) === idx;
        }).sort((a, b) => {
            if (a.category === RHCategory.TOPIC) {
                return b.order - a.order;
            } else {
                const aTime = a.publishDate ? new Date(a.publishDate).getTime() : 0;
                const bTime = b.publishDate ? new Date(b.publishDate).getTime() : 0;
                return bTime - aTime;
            }
        });
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: RHTreeItem): vscode.TreeItem {
        return element;
    }

    async refreshItems(hint: boolean = false) {
        const ret = await getLatestItems<RHTreeItem>(this.category);
        if (ret.success && ret.result) {
            this.itemList = this.parseResult(ret.result);
            this.refresh();
            if (hint) {
                ReadhubConfig.showNotification('ReadHub 资讯已更新');
            }
        } else if (hint) {
            ReadhubConfig.showErrorMessage('刷新 ReadHub 资讯失败');
        }
    }

    async getChildren(element?: RHTreeItem): Promise<RHTreeItem[]> {
        if (!element) {
            return Promise.resolve(this.itemList);
        }

        try {
            const source = element.command!.arguments![0].source;
            switch (source) {
                case RHCategory.TOPIC.nameKey:
                    const topicObj = element as RHTopic;
                    const items = Array.isArray(topicObj.newsArray) && topicObj.newsArray.map(i => {
                        let item = new RHTreeItem(`${i.siteName}  [${getTimeDelta(i.publishDate)}]`);
                        item = {
                            ...item,
                            url: i.url,
                            collapsibleState: vscode.TreeItemCollapsibleState.None,
                            label: '',
                            tooltip: '',
                            description: item.title,
                            contextValue: 'readhubRefEntry'
                        };
                        return item;
                    }) || [];
                    return Promise.resolve(items);
                case RHCategory.NEWS.nameKey:
                case RHCategory.TECH_NEWS.nameKey:
                case RHCategory.BLOCKCHAIN.nameKey:
                    const obj = element as RHNews;
                    let item = new RHTreeItem(obj.siteName);
                    if (obj.authorName !== "") {
                        item.title += ` / ${obj.authorName}`;
                    }
                    item = {
                        ...item,
                        url: obj.url,
                        collapsibleState: vscode.TreeItemCollapsibleState.None,
                        label: '',
                        tooltip: '',
                        description: `${item.title}  [${getTimeDelta(obj.publishDate)}]`,
                        contextValue: 'readhubRefEntry'
                    };
                    return Promise.resolve([item]);
            }
        } catch (ex) {
            // IGNORE
        }

        return Promise.resolve([]);
    }
}