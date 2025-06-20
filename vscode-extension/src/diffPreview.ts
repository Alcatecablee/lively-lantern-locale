
import * as vscode from 'vscode';
import { NeuroLintLayerResult } from './neurolint/types';

export class DiffPreview {
    async showDiff(
        original: string,
        transformed: string,
        fileName: string,
        layers: NeuroLintLayerResult[]
    ): Promise<boolean> {
        // Create temporary files for diff comparison
        const originalUri = vscode.Uri.parse(`untitled:${fileName}.original`);
        const transformedUri = vscode.Uri.parse(`untitled:${fileName}.transformed`);

        // Show diff in editor
        await vscode.commands.executeCommand(
            'vscode.diff',
            originalUri,
            transformedUri,
            `NeuroLint: ${fileName} (Original ↔ Transformed)`
        );

        // Create temporary documents
        const originalDoc = await vscode.workspace.openTextDocument({
            content: original,
            language: this.getLanguageFromFileName(fileName)
        });
        
        const transformedDoc = await vscode.workspace.openTextDocument({
            content: transformed,
            language: this.getLanguageFromFileName(fileName)
        });

        // Show transformation summary
        const summary = this.createTransformationSummary(layers);
        const choice = await vscode.window.showInformationMessage(
            `NeuroLint transformation complete!\n\n${summary}`,
            { modal: true },
            'Apply Changes',
            'Cancel'
        );

        return choice === 'Apply Changes';
    }

    private getLanguageFromFileName(fileName: string): string {
        if (fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) {
            return 'typescriptreact';
        } else if (fileName.endsWith('.ts')) {
            return 'typescript';
        } else if (fileName.endsWith('.js')) {
            return 'javascript';
        } else if (fileName.endsWith('.json')) {
            return 'json';
        }
        return 'plaintext';
    }

    private createTransformationSummary(layers: NeuroLintLayerResult[]): string {
        const successful = layers.filter(l => l.success);
        const totalChanges = layers.reduce((sum, l) => sum + (l.changeCount || 0), 0);
        const totalTime = layers.reduce((sum, l) => sum + (l.executionTime || 0), 0);

        let summary = `${successful.length}/${layers.length} layers successful\n`;
        summary += `${totalChanges} changes made in ${totalTime}ms\n\n`;

        if (successful.length > 0) {
            summary += "Applied transformations:\n";
            successful.forEach(layer => {
                summary += `• ${layer.name}: ${layer.changeCount || 0} changes\n`;
            });
        }

        const failed = layers.filter(l => !l.success);
        if (failed.length > 0) {
            summary += "\nFailed transformations:\n";
            failed.forEach(layer => {
                summary += `• ${layer.name}: ${layer.message || 'Unknown error'}\n`;
            });
        }

        return summary;
    }
}
