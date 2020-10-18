import * as vscode from 'vscode';

export default class ZettelkastenUtilities {
  static generateId() {
    const date = new Date();
    const padNumber = (val: number, len: number) => val.toString().padStart(len, '0');
    const id = [
      padNumber(date.getFullYear(), 4),
      padNumber(date.getMonth(), 2),
      padNumber(date.getDate(), 2),
      padNumber(date.getHours(), 2),
      padNumber(date.getMinutes(), 2),
    ].join('');
    return id;
  }

  static insertId() {
    const editor = vscode.window.activeTextEditor;
    if (editor == null) return;

    const newId = ZettelkastenUtilities.generateId();
    editor.insertSnippet(new vscode.SnippetString(newId));
  }
}