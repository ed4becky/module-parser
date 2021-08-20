"use strict";
exports.__esModule = true;
exports.parseModuleFile = void 0;
var ts = require("typescript");
function parseModuleFile(file) {
    var module = {
        className: '',
        fileLocation: ''
    };
    walker(file);
    return module;
    function walker(node) {
        switch (node.kind) {
            case ts.SyntaxKind.ImportDeclaration:
                declarationWalker(node);
                break;
            case ts.SyntaxKind.ClassDeclaration:
                classWalker(node);
                break;
            default:
                ts.forEachChild(node, walker);
        }
    }
    function declarationWalker(node) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        module.imports = (_a = module.imports) !== null && _a !== void 0 ? _a : [];
        if (((_c = (_b = node.importClause) === null || _b === void 0 ? void 0 : _b.namedBindings) === null || _c === void 0 ? void 0 : _c.kind) === ts.SyntaxKind.NamedImports) {
            var tmp = (_f = (_e = (_d = node.importClause) === null || _d === void 0 ? void 0 : _d.namedBindings) === null || _e === void 0 ? void 0 : _e.elements) !== null && _f !== void 0 ? _f : [];
            tmp.forEach(function (el) {
                // @ts-ignore
                module.imports.push({
                    importClass: el.getText(),
                    importLib: node.moduleSpecifier.getText()
                });
            });
        }
        else if (((_h = (_g = node.importClause) === null || _g === void 0 ? void 0 : _g.namedBindings) === null || _h === void 0 ? void 0 : _h.kind) === ts.SyntaxKind.NamespaceImport) {
            module.imports.push({
                importClass: '*',
                importLib: node.moduleSpecifier.getText()
            });
        }
    }
    function classWalker(node) {
        var _a, _b;
        module.className = (_b = (_a = node.name) === null || _a === void 0 ? void 0 : _a.getText()) !== null && _b !== void 0 ? _b : '';
        ts.forEachChild(node, function (child) {
            if (child.kind === ts.SyntaxKind.Decorator) {
                var decorator = child;
                decoratorWalker(decorator);
            }
        });
    }
    function decoratorWalker(node) {
        node.expression.arguments.forEach(function (literal) {
            literal.forEachChild(function (p) {
                var _a;
                switch ((_a = p.name) === null || _a === void 0 ? void 0 : _a.getText()) {
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
    function processImports(p) {
        var _a;
        module.ngImports = (_a = module.ngImports) !== null && _a !== void 0 ? _a : [];
        p.initializer.forEachChild(function (i) {
            // @ts-ignore
            module.ngImports.push(i.escapedText);
        });
    }
    function processExports(p) {
        var _a;
        module.ngExports = (_a = module.ngExports) !== null && _a !== void 0 ? _a : [];
        p.initializer.forEachChild(function (i) {
            // @ts-ignore
            module.ngExports.push(i.escapedText);
        });
    }
    function processDeclarations(p) {
        var _a;
        module.ngDeclaractions = (_a = module.ngDeclaractions) !== null && _a !== void 0 ? _a : [];
        p.initializer.forEachChild(function (i) {
            // @ts-ignore
            module.ngDeclaractions.push(i.escapedText);
        });
    }
}
exports.parseModuleFile = parseModuleFile;
