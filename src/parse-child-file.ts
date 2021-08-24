import * as ts from 'typescript';
import {ModuleChild, ModuleComponent} from './model';
import {parseTemplate} from './parse-template';

export function parseChildFile(file: ts.SourceFile): ModuleChild {

    let element: ModuleChild = new ModuleChild();

    walker(file);
    return element;

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
        if (node.importClause?.namedBindings?.kind === ts.SyntaxKind.NamedImports) {
            const tmp = (node.importClause?.namedBindings as ts.NamedImports)?.elements ?? [];
            tmp.forEach(el => {
                    // @ts-ignore
                    element.imports.push({
                        importClass: el.getText(),
                        importLib: node.moduleSpecifier.getText()
                    });
                }
            );
        } else if (node.importClause?.namedBindings?.kind === ts.SyntaxKind.NamespaceImport) {
            // @ts-ignore
            element.imports.push({
                importClass: '*',
                importLib: node.moduleSpecifier.getText()
            });
        }
    }

    function classWalker(node: ts.ClassDeclaration) {
        element.name = node.name?.getText() ?? '';

        ts.forEachChild(node, (child) => {
            if (child.kind === ts.SyntaxKind.Decorator) {
                const decorator = child as ts.Decorator;
                decoratorWalker(decorator);
            } else if (child.kind === ts.SyntaxKind.Constructor) {
                const ctor = child as ts.ConstructorTypeNode;
                constructorWalker(ctor);
            } else if (child.kind === ts.SyntaxKind.PropertyDeclaration) {
                const prop = child as ts.PropertyDeclaration;
                propertyWalker(prop);
            } else if (child.kind === ts.SyntaxKind.MethodDeclaration) {
                const method = child as ts.MethodDeclaration;
                methodWalker(method);
            }
        });
    }

    function decoratorWalker(node: ts.Decorator) {
        (node.expression as ts.CallExpression).arguments.forEach((literal: ts.Expression) => {
            literal.forEachChild((p: any) => {
                switch (p.name?.getText()) {
                    case 'selector':
                        (element as ModuleComponent).selector = p.initializer.text;
                        break;
                    case 'template':
                        // @ts-ignore
                        element.dependencies.selectors = {
                            ...element.dependencies?.selectors,
                            ...parseTemplate(p.initializer.getText())
                        };
                        break;
                    default:
                }
            });
        });
    }

    function constructorWalker(ctor: ts.ConstructorTypeNode) {
        if (ctor.parameters && ctor.parameters.length > 0) {
            ctor.parameters.forEach(p => {
                if (p.type) {
                    addDependency(p);
                }
            });
        }
    }

    function propertyWalker(p: ts.PropertyDeclaration) {
        if (p.type) {
            if (p.type) {
                addDependency(p);
            }
        }
    }

    function addDependency(p: ts.Node): void {
        // @ts-ignore
        const klasses = p.type.getText().split('|');
        for (const klass in klasses) {
            const keys = klasses[klass]
                .trim()
                .replace('[]', '').split('<');
            let key = keys[0].trim();
            if (isNaN(key.charAt(0) * 1) && (key.charAt(0) === key.charAt(0).toUpperCase())) {
                if(key !== 'Array')
                element.dependencies.classes[key] = true;
            }
            if(keys[1]) {
                key = keys[1].replace('>', '').trim();
            }
            if (isNaN(key.charAt(0) * 1) && (key.charAt(0) === key.charAt(0).toUpperCase())) {
                if(key !== 'Array')
                element.dependencies.classes[key] = true;
            }
        }
    }

    function methodWalker(method: ts.MethodDeclaration) {

        if (method.parameters && method.parameters.length > 0) {
            method.parameters.forEach(p => {
                if (p.type) {
                    addDependency(p);
                }
            });
        }
    }
}

