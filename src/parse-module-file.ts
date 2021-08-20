import * as ts from 'typescript';
import {Module} from './model';

export function parseModuleFile(file: ts.SourceFile): Module {

    let module: Module = {
        className: '',
        fileLocation: ''
    };
    walker(file);
    return module;

    function walker(node: ts.Node) {
        switch (node.kind) {
            case ts.SyntaxKind.ImportDeclaration:
                declarationWalker(node as ts.ImportDeclaration);
                break;
            case ts.SyntaxKind.ClassDeclaration:
                classWalker(node as ts.ClassDeclaration);
                break;
            default:
                ts.forEachChild(node, walker);
        }
    }

    function declarationWalker(node: ts.ImportDeclaration) {
        module.imports = module.imports ?? [];
        if (node.importClause?.namedBindings?.kind === ts.SyntaxKind.NamedImports) {
            const tmp = (node.importClause?.namedBindings as ts.NamedImports)?.elements ?? [];
            tmp.forEach(el => {
                    // @ts-ignore
                    module.imports.push({
                        importClass: el.getText(),
                        importLib: node.moduleSpecifier.getText()
                    });
                }
            );
        } else if (node.importClause?.namedBindings?.kind === ts.SyntaxKind.NamespaceImport) {
            module.imports.push({
                importClass: '*',
                importLib: node.moduleSpecifier.getText()
            });
        }
    }

    function classWalker(node: ts.ClassDeclaration) {
        module.className = node.name?.getText() ?? '';

        ts.forEachChild(node, (child) => {
            if (child.kind === ts.SyntaxKind.Decorator) {
                const decorator = child as ts.Decorator;
                decoratorWalker(decorator);
            }
        });
    }

    function decoratorWalker(node: ts.Decorator) {
        (node.expression as ts.CallExpression).arguments.forEach((literal: ts.Expression) => {
            literal.forEachChild((p: any) => {
                switch (p.name?.getText()) {
                    case 'imports':
                        processImports(p);
                        break;
                    case 'exports':
                        processExports(p);
                        break;
                    case 'declarations':
                        processDeclarations(p);
                        break;
                    default:
                }
            });
        });
    }


    function processImports(p: ts.PropertyAssignment) {
        module.ngImports = module.ngImports ?? [];
        p.initializer.forEachChild((i) => {
            // @ts-ignore
            module.ngImports.push(i.escapedText);
        });
    }

    function processExports(p: ts.PropertyAssignment) {
        module.ngExports = module.ngExports ?? [];
        p.initializer.forEachChild((i) => {
            // @ts-ignore
            module.ngExports.push(i.escapedText);
        });
    }

    function processDeclarations(p: ts.PropertyAssignment) {
        module.ngDeclaractions = module.ngDeclaractions ?? [];
        p.initializer.forEachChild((i) => {
            // @ts-ignore
            module.ngDeclaractions.push(i.escapedText);
        });
    }
}

