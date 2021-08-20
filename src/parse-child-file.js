"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.parseChildFile = void 0;
var ts = require("typescript");
var parse_template_1 = require("./parse-template");
function parseChildFile(file) {
    var element = {
        name: '',
        fileLocation: '',
        dependencies: {
            classes: {},
            selectors: {}
        },
        imports: []
    };
    walker(file);
    return element;
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
        var _a, _b, _c, _d, _e, _f, _g;
        if (((_b = (_a = node.importClause) === null || _a === void 0 ? void 0 : _a.namedBindings) === null || _b === void 0 ? void 0 : _b.kind) === ts.SyntaxKind.NamedImports) {
            var tmp = (_e = (_d = (_c = node.importClause) === null || _c === void 0 ? void 0 : _c.namedBindings) === null || _d === void 0 ? void 0 : _d.elements) !== null && _e !== void 0 ? _e : [];
            tmp.forEach(function (el) {
                // @ts-ignore
                element.imports.push({
                    importClass: el.getText(),
                    importLib: node.moduleSpecifier.getText()
                });
            });
        }
        else if (((_g = (_f = node.importClause) === null || _f === void 0 ? void 0 : _f.namedBindings) === null || _g === void 0 ? void 0 : _g.kind) === ts.SyntaxKind.NamespaceImport) {
            // @ts-ignore
            element.imports.push({
                importClass: '*',
                importLib: node.moduleSpecifier.getText()
            });
        }
    }
    function classWalker(node) {
        var _a, _b;
        element.name = (_b = (_a = node.name) === null || _a === void 0 ? void 0 : _a.getText()) !== null && _b !== void 0 ? _b : '';
        ts.forEachChild(node, function (child) {
            if (child.kind === ts.SyntaxKind.Decorator) {
                var decorator = child;
                decoratorWalker(decorator);
            }
            else if (child.kind === ts.SyntaxKind.Constructor) {
                var ctor = child;
                constructorWalker(ctor);
            }
            else if (child.kind === ts.SyntaxKind.PropertyDeclaration) {
                var prop = child;
                propertyWalker(prop);
            }
            else if (child.kind === ts.SyntaxKind.MethodDeclaration) {
                var method = child;
                methodWalker(method);
            }
        });
    }
    function decoratorWalker(node) {
        node.expression.arguments.forEach(function (literal) {
            literal.forEachChild(function (p) {
                var _a, _b;
                switch ((_a = p.name) === null || _a === void 0 ? void 0 : _a.getText()) {
                    case 'selector':
                        element.selector = p.initializer.text;
                        break;
                    case 'template':
                        // @ts-ignore
                        element.dependencies.selectors = __assign(__assign({}, (_b = element.dependencies) === null || _b === void 0 ? void 0 : _b.selectors), parse_template_1.parseTemplate(p.initializer.getText()));
                        break;
                    default:
                }
            });
        });
    }
    function constructorWalker(ctor) {
        if (ctor.parameters && ctor.parameters.length > 0) {
            ctor.parameters.forEach(function (p) {
                if (p.type) {
                    addDependency(p);
                }
            });
        }
    }
    function propertyWalker(p) {
        if (p.type) {
            if (p.type) {
                addDependency(p);
            }
        }
    }
    function addDependency(p) {
        // @ts-ignore
        var klasses = p.type.getText().split('|');
        for (var klass in klasses) {
            var keys = klasses[klass]
                .trim()
                .replace('[]', '').split('<');
            var key = keys[0].trim();
            if (isNaN(key.charAt(0) * 1) && (key.charAt(0) === key.charAt(0).toUpperCase())) {
                // @ts-ignore
                element.dependencies.classes[key] = true;
            }
            if (keys[1]) {
                key = keys[1].replace('>', '').trim();
            }
            if (isNaN(key.charAt(0) * 1) && (key.charAt(0) === key.charAt(0).toUpperCase())) {
                // @ts-ignore
                element.dependencies.classes[key] = true;
            }
        }
    }
    function methodWalker(method) {
        if (method.parameters && method.parameters.length > 0) {
            method.parameters.forEach(function (p) {
                if (p.type) {
                    addDependency(p);
                }
            });
        }
    }
}
exports.parseChildFile = parseChildFile;
