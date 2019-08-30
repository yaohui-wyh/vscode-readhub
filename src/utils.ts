'use strict';

import * as moment from 'moment';
import * as vscode from 'vscode';

export class ReadhubConfig {

    public static getNotificationConfig() {
        return vscode.workspace.getConfiguration().get('readhub.showNotification');
    }

    public static setNotificationConfig(config: boolean) {
        vscode.workspace.getConfiguration().update('readhub.showNotification', config, vscode.ConfigurationTarget.Global);
    }

    public static showNotification(message: string) {
        if (!this.getNotificationConfig()) {
            return;
        }
        vscode.window.showInformationMessage(message, '不再提示')
            .then(action => {
                if (action === '不再提示') {
                    ReadhubConfig.setNotificationConfig(false);
                }
            });
    }

    public static showErrorMessage(message: string) {
        if (!this.getNotificationConfig()) {
            return;
        }
        vscode.window.showErrorMessage(message, "不再提示")
            .then(action => {
                if (action === '不再提示') {
                    ReadhubConfig.setNotificationConfig(false);
                }
            });
    }
}

export function getTimeDelta(time?: Date | string) {
    if (!time) {
        return "";
    }
    const daysDelta = moment().diff(moment(time), 'days');
    if (daysDelta > 0) {
        return `${daysDelta}天前`;
    }
    const hoursDela = moment().diff(moment(time), 'hours');
    if (hoursDela > 0) {
        return `${hoursDela}小时前`;
    }
    const minutesDelta = moment().diff(moment(time), 'minutes');
    if (minutesDelta > 0) {
        return `${minutesDelta}分钟前`;
    }
    return "几秒前";
}

let _channel: vscode.OutputChannel;
export function getOutputChannel(): vscode.OutputChannel {
    if (!_channel) {
        _channel = vscode.window.createOutputChannel(Constants.outputChannel);
    }
    return _channel;
}

export namespace Constants {
    export const outputChannel = "ReadHub";
    export const apiHost = "https://api.readhub.cn";
}