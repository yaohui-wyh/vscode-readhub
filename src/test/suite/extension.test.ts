import * as assert from 'assert';
import * as vscode from 'vscode';
import { before } from 'mocha';
import { ReadhubConfig } from '../../utils';

suite('Extension Test Suite', () => {
    before(() => {
        vscode.window.showInformationMessage('Start all tests.');
    });

    test('Configuration test', () => {
        assert.equal(ReadhubConfig.getNotificationConfig(), true);
    });
});
