
import * as vscode from 'vscode';
import { LAYER_LIST } from './neurolint/orchestrator';

export class LayerSelector {
    constructor(private context: vscode.ExtensionContext) {}

    async showLayerSelector() {
        const config = vscode.workspace.getConfiguration('neurolint');
        const currentLayers = config.get<number[]>('enabledLayers', [1, 2, 3, 4]);

        const items = LAYER_LIST.map(layer => ({
            label: layer.name,
            description: layer.description,
            detail: layer.astSupported ? '✨ AST-powered' : 'Regex-based',
            picked: currentLayers.includes(layer.id),
            layerId: layer.id
        }));

        const selectedItems = await vscode.window.showQuickPick(items, {
            canPickMany: true,
            title: 'Select NeuroLint Transformation Layers',
            placeHolder: 'Choose which layers to apply during transformation'
        });

        if (selectedItems) {
            const selectedLayers = selectedItems.map(item => item.layerId);
            await config.update('enabledLayers', selectedLayers, vscode.ConfigurationTarget.Workspace);
            
            vscode.window.showInformationMessage(
                `NeuroLint: Selected ${selectedLayers.length} layer(s)`
            );
        }
    }
}
