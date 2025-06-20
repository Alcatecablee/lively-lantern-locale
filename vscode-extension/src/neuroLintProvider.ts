
import * as vscode from 'vscode';
import { NeuroLintOrchestrator, LAYER_LIST } from './neurolint/orchestrator';
import { NeuroLintLayerResult } from './neurolint/types';

export interface TransformResult {
    transformed: string;
    layers: NeuroLintLayerResult[];
}

export class NeuroLintProvider {
    constructor() {}

    isSupportedFile(fileName: string): boolean {
        const supportedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];
        return supportedExtensions.some(ext => fileName.endsWith(ext));
    }

    async transformCode(
        code: string,
        filePath?: string,
        progress?: vscode.Progress<{message?: string; increment?: number}>
    ): Promise<TransformResult> {
        const config = vscode.workspace.getConfiguration('neurolint');
        const enabledLayers = config.get<number[]>('enabledLayers', [1, 2, 3, 4]);
        const useAST = config.get<boolean>('useAST', true);

        if (progress) {
            progress.report({ message: 'Initializing transformation...' });
        }

        try {
            const result = await NeuroLintOrchestrator(
                code,
                filePath,
                useAST,
                enabledLayers
            );

            return {
                transformed: result.transformed,
                layers: result.layers
            };
        } catch (error) {
            throw new Error(`Transformation failed: ${error}`);
        }
    }

    getAvailableLayers() {
        return LAYER_LIST;
    }
}
