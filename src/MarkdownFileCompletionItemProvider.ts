import * as vscode from 'vscode';
import { Ref, RefType, getRefAt } from './Ref';
import { NoteWorkspace } from './NoteWorkspace';
import { NoteParser } from './NoteParser';

class MarkdownFileCompletionItem extends vscode.CompletionItem {
  fsPath?: string;

  constructor(label: string, fsPath: string) {
    super(label, vscode.CompletionItemKind.File);
    this.fsPath = fsPath;

    // Support The Archive / Zettlr-style IDs
    const id = label.match(/^\d{12}/);
    if (id) { this.insertText = id[0]; }
  }
}
// Given a document and position, check whether the current word matches one of
// these 2 contexts:
// 1. [[wiki-links]]
// 2. #tags
//
// If so, provide appropriate completion items from the current workspace
export class MarkdownFileCompletionItemProvider implements vscode.CompletionItemProvider {
  public async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ) {
    const ref = getRefAt(document, position);
    switch (ref.type) {
      case RefType.Null:
        return [];
      case RefType.Tag:
        return (await NoteParser.distinctTags()).map((t) => {
          let kind = vscode.CompletionItemKind.File;
          let label = `${t}`; // cast to a string
          let item = new vscode.CompletionItem(label, kind);
          if (ref && ref.range) {
            item.range = ref.range;
          }
          return item;
        });
      case RefType.WikiLink:
        return (await NoteWorkspace.noteFiles()).map((f) => {
          let label = NoteWorkspace.wikiLinkCompletionForConvention(f, document);
          let item = new MarkdownFileCompletionItem(label, f.fsPath);
          if (ref && ref.range) {
            item.range = ref.range;
          }
          return item;
        }).filter(item => item.insertText !== ref.word);
      default:
        return [];
    }
  }

  public async resolveCompletionItem(
    item: MarkdownFileCompletionItem,
    token: vscode.CancellationToken
  ): Promise<MarkdownFileCompletionItem> {
    const fsPath = item.fsPath;
    if (fsPath) {
      let note = NoteParser.noteFromFsPath(fsPath);
      if (note) {
        item.detail = note.title?.text;
        item.documentation = note.documentation();
      }
    }
    return item;
  }
}
