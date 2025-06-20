
import * as vscode from 'vscode';
import { NeuroLintProvider } from './neuroLintProvider';
import { LayerSelector } from './layerSelector';
import { DiffPreview } from './diffPreview';

export function activate(context: vscode.ExtensionContext) {
    const neuroLintProvider = new NeuroLintProvider();
    const layerSelector = new LayerSelector(context);
    const diffPreview = new DiffPreview();

    // Set supported languages context
    vscode.commands.executeCommand('setContext', 'neurolint.supportedLanguages', [
        'javascript', 'typescript', 'javascriptreact', 'typescriptreact', 'json'
    ]);
    
    vscode.commands.executeCommand('setContext', 'neurolint.supportedExtensions', [
        '.js', '.jsx', '.ts', '.tsx', '.json'
    ]);

    // Register commands
    const transformFileCommand = vscode.commands.registerCommand(
        'neurolint.transformFile',
        async (uri?: vscode.Uri) => {
            await handleTransformFile(neuroLintProvider, diffPreview, uri);
        }
    );

    const transformSelectionCommand = vscode.commands.registerCommand(
        'neurolint.transformSelection',
        async () => {
            await handleTransformSelection(neuroLintProvider, diffPreview);
        }
    );

    const selectLayersCommand = vscode.commands.registerCommand(
        'neurolint.selectLayers',
        async () => {
            await layerSelector.showLayerSelector();
        }
    );

    const transformWorkspaceCommand = vscode.commands.registerCommand(
        'neurolint.transformWorkspace',
        async () => {
            await handleTransformWorkspace(neuroLintProvider, diffPreview);
        }
    );

    // Register status bar
    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );
    statusBarItem.text = "$(brain) NeuroLint";
    statusBarItem.command = 'neurolint.selectLayers';
    statusBarItem.tooltip = 'Configure NeuroLint layers';
    statusBarItem.show();

    context.subscriptions.push(
        transformFileCommand,
        transformSelectionCommand,
        selectLayersCommand,
        transformWorkspaceCommand,
        statusBarItem
    );
}

async function handleTransformFile(
    provider: NeuroLintProvider,
    diffPreview: DiffPreview,
    uri?: vscode.Uri
) {
    const editor = vscode.window.activeTextEditor;
    const targetUri = uri || editor?.document.uri;
    
    if (!targetUri) {
        vscode.window.showErrorMessage('No file selected');
        return;
    }

    const document = await vscode.workspace.openTextDocument(targetUri);
    const originalCode = document.getText();
    
    if (!provider.isSupportedFile(document.fileName)) {
        vscode.window.showWarningMessage('File type not supported by NeuroLint');
        return;
    }

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'NeuroLint: Transforming file...',
        cancellable: false
    }, async (progress) => {
        try {
            const result = await provider.transformCode(originalCode, document.fileName, progress);
            
            if (result.transformed !== originalCode) {
                const config = vscode.workspace.getConfiguration('neurolint');
                const showPreview = config.get<boolean>('showDiffPreview', true);
                
                if (showPreview) {
                    const shouldApply = await diffPreview.showDiff(
                        originalCode,
                        result.transformed,
                        document.fileName,
                        result.layers
                    );
                    
                    if (shouldApply) {
                        await applyTransformation(document, result.transformed);
                    }
                } else {
                    await applyTransformation(document, result.transformed);
                }
            } else {
                vscode.window.showInformationMessage('No changes needed');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`NeuroLint error: ${error}`);
        }
    });
}

async function handleTransformSelection(
    provider: NeuroLintProvider,
    diffPreview: DiffPreview
) {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !editor.selection) {
        vscode.window.showErrorMessage('No text selected');
        return;
    }

    const selectedText = editor.document.getText(editor.selection);
    if (!selectedText.trim()) {
        vscode.window.showErrorMessage('No text selected');
        return;
    }

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'NeuroLint: Transforming selection...',
        cancellable: false
    }, async (progress) => {
        try {
            const result = await provider.transformCode(selectedText, editor.document.fileName, progress);
            
            if (result.transformed !== selectedText) {
                const config = vscode.workspace.getConfiguration('neurolint');
                const showPreview = config.get<boolean>('showDiffPreview', true);
                
                if (showPreview) {
                    const shouldApply = await diffPreview.showDiff(
                        selectedText,
                        result.transformed,
                        'selection',
                        result.layers
                    );
                    
                    if (shouldApply) {
                        await editor.edit(editBuilder => {
                            editBuilder.replace(editor.selection, result.transformed);
                        });
                    }
                } else {
                    await editor.edit(editBuilder => {
                        editBuilder.replace(editor.selection, result.transformed);
                    });
                }
            } else {
                vscode.window.showInformationMessage('No changes needed');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`NeuroLint error: ${error}`);
        }
    });
}

async function handleTransformWorkspace(
    provider: NeuroLintProvider,
    diffPreview: DiffPreview
) {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
    }

    const files = await vscode.workspace.findFiles(
        '**/*.{js,jsx,ts,tsx,json}',
        '**/node_modules/**'
    );

    if (files.length === 0) {
        vscode.window.showInformationMessage('No supported files found in workspace');
        return;
    }

    const selectedFiles = await vscode.window.showQuickPick(
        files.map(f => ({
            label: vscode.workspace.asRelativePath(f),
            uri: f
        })),
        {
            canPickMany: true,
            title: 'Select files to transform'
        }
    );

    if (!selectedFiles || selectedFiles.length === 0) {
        return;
    }

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'NeuroLint: Transforming workspace files...',
        cancellable: false
    }, async (progress) => {
        let processed = 0;
        const results: Array<{file: string, changed: boolean}> = [];

        for (const file of selectedFiles) {
            progress.report({
                message: `Processing ${file.label}...`,
                increment: (100 / selectedFiles.length)
            });

            try {
                const document = await vscode.workspace.openTextDocument(file.uri);
                const originalCode = document.getText();
                const result = await provider.transformCode(originalCode, document.fileName);
                
                if (result.transformed !== originalCode) {
                    await applyTransformation(document, result.transformed);
                    results.push({file: file.label, changed: true});
                } else {
                    results.push({file: file.label, changed: false});
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Error processing ${file.label}: ${error}`);
            }
            
            processed++;
        }

        const changedCount = results.filter(r => r.changed).length;
        vscode.window.showInformationMessage(
            `NeuroLint: Processed ${processed} files, ${changedCount} files changed`
        );
    });
}

async function applyTransformation(document: vscode.TextDocument, transformedCode: string) {
    const edit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(document.getText().length)
    );
    edit.replace(document.uri, fullRange, transformedCode);
    await vscode.workspace.applyEdit(edit);
    await document.save();
}

export function deactivate() {}
