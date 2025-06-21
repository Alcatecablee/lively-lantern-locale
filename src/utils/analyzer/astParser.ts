import * as ts from 'typescript';

export interface ASTNode {
  kind: ts.SyntaxKind;
  text: string;
  start: number;
  end: number;
  line: number;
  column: number;
  parent?: ASTNode;
  children: ASTNode[];
}

export interface ParsedFile {
  sourceFile: ts.SourceFile;
  fileName: string;
}

export class ASTParser {
  private compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    jsx: ts.JsxEmit.React,
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    allowSyntheticDefaultImports: true,
    declaration: false,
    noEmit: true
  };

  parseFile(fileName: string, content: string): ParsedFile {
    // Create source file without full program for browser compatibility
    const sourceFile = ts.createSourceFile(
      fileName,
      content,
      ts.ScriptTarget.Latest,
      true,
      fileName.endsWith('.tsx') || fileName.endsWith('.jsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );

    return {
      sourceFile,
      fileName
    };
  }

  visitNode(node: ts.Node, visitor: (node: ts.Node) => void): void {
    visitor(node);
    ts.forEachChild(node, (child) => this.visitNode(child, visitor));
  }

  findNodes(sourceFile: ts.SourceFile, predicate: (node: ts.Node) => boolean): ts.Node[] {
    const result: ts.Node[] = [];

    const visit = (node: ts.Node) => {
      if (predicate(node)) {
        result.push(node);
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return result;
  }

  getLineAndColumn(sourceFile: ts.SourceFile, position: number): { line: number; column: number } {
    const line = ts.getLineAndCharacterOfPosition(sourceFile, position).line + 1;
    const column = ts.getLineAndCharacterOfPosition(sourceFile, position).character + 1;
    return { line, column };
  }

  isReactComponent(node: ts.Node): boolean {
    if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      // Check if it returns JSX
      const returnType = this.getReturnType(node);
      return this.containsJSX(node) || this.isJSXReturnType(returnType);
    }
    return false;
  }

  containsJSX(node: ts.Node): boolean {
    let hasJSX = false;
    this.visitNode(node, (child) => {
      if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child) || ts.isJsxFragment(child)) {
        hasJSX = true;
      }
    });
    return hasJSX;
  }

  private getReturnType(node: ts.FunctionLikeDeclaration): string {
    if (node.type) {
      return node.type.getText();
    }
    return '';
  }

  private isJSXReturnType(returnType: string): boolean {
    return returnType.includes('JSX.Element') || 
           returnType.includes('React.ReactElement') || 
           returnType.includes('ReactNode');
  }

  isHookCall(node: ts.Node): boolean {
    if (ts.isCallExpression(node)) {
      const expression = node.expression;
      if (ts.isIdentifier(expression)) {
        return expression.text.startsWith('use') && expression.text.length > 3;
      }
      if (ts.isPropertyAccessExpression(expression)) {
        return ts.isIdentifier(expression.name) && 
               expression.name.text.startsWith('use') && 
               expression.name.text.length > 3;
      }
    }
    return false;
  }

  findJSXElements(sourceFile: ts.SourceFile): ts.JsxElement[] {
    return this.findNodes(sourceFile, ts.isJsxElement) as ts.JsxElement[];
  }

  findJSXSelfClosingElements(sourceFile: ts.SourceFile): ts.JsxSelfClosingElement[] {
    return this.findNodes(sourceFile, ts.isJsxSelfClosingElement) as ts.JsxSelfClosingElement[];
  }

  findImportDeclarations(sourceFile: ts.SourceFile): ts.ImportDeclaration[] {
    return this.findNodes(sourceFile, ts.isImportDeclaration) as ts.ImportDeclaration[];
  }

  findVariableDeclarations(sourceFile: ts.SourceFile): ts.VariableDeclaration[] {
    return this.findNodes(sourceFile, ts.isVariableDeclaration) as ts.VariableDeclaration[];
  }

  findFunctionDeclarations(sourceFile: ts.SourceFile): ts.FunctionDeclaration[] {
    return this.findNodes(sourceFile, ts.isFunctionDeclaration) as ts.FunctionDeclaration[];
  }

  findCallExpressions(sourceFile: ts.SourceFile): ts.CallExpression[] {
    return this.findNodes(sourceFile, ts.isCallExpression) as ts.CallExpression[];
  }

  findPropertyAccessExpressions(sourceFile: ts.SourceFile): ts.PropertyAccessExpression[] {
    return this.findNodes(sourceFile, ts.isPropertyAccessExpression) as ts.PropertyAccessExpression[];
  }

  getNodeText(node: ts.Node): string {
    return node.getText();
  }

  getNodeKindName(node: ts.Node): string {
    return ts.SyntaxKind[node.kind];
  }
}