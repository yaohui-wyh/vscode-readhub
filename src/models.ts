import * as vscode from 'vscode';

export class RHCategory {
    public static TOPIC = new RHCategory("RHCategory.topic", "", "topic");
    public static NEWS = new RHCategory("RHCategory.news", "news", "news");
    public static TECH_NEWS = new RHCategory("RHCategory.technews", "tech", "technews");
    public static BLOCKCHAIN = new RHCategory("RHCategory.blockchain", "blockchain", "blockchain");
    public static JOB = new RHCategory("RHCategory.jobs", "jobs", "jobs");

    constructor(
        public nameKey: string = "",
        public path: string = "",
        public apiPath: string = ""
    ) { }
}

export class RHTreeItem extends vscode.TreeItem {
    public id: string = "";
    public order: number = 0;
    public url: string = "";
    public summary: string = "";
    public publishDate?: Date;
    public hasInstantView?: boolean = false;

    constructor(
        public title: string = "",
        public category?: RHCategory,
        public readonly command?: vscode.Command
    ) {
        super(title, vscode.TreeItemCollapsibleState.Collapsed);
    }

    tooltip = this.title;
}

export class RHNews extends RHTreeItem {
    public siteName: string = "";
    public authorName: string = "";

    constructor(
        public title: string,
        public readonly command?: vscode.Command
    ) {
        super(title, RHCategory.NEWS, command);
    }
}

export class RHTopic extends RHTreeItem {
    public createdAt?: Date;
    public updatedAt?: Date;
    public newsArray?: Array<RHTopicNewsItem>;

    constructor(
        public title: string,
        public readonly command?: vscode.Command
    ) {
        super(title, RHCategory.TOPIC, command);
    }
}

export class RHTopicNewsItem {
    public id: string = "";
    public authorName: string = "";
    public publishDate?: Date;
    public siteName: string = "";
    public title: string = "";
    public url: string = "";
}

export class RHInstantView {
    public content: string = "";
    public siteName: string = "";
    public siteSlug: string = "";
    public title: string = "";
    public url: string = "";
}