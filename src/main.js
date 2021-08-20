#!/usr/bin/env node
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
exports.parseProject = void 0;
var fs_1 = require("fs");
var path_1 = require("path");
var process_1 = require("process");
var ts = require("typescript");
var audit_project_1 = require("./audit-project");
var fix_project_1 = require("./fix-project");
var create_provider_map_1 = require("./create-provider-map");
var directory_parser_1 = require("./directory-parser");
var parse_child_file_1 = require("./parse-child-file");
var parse_module_file_1 = require("./parse-module-file");
var parse_template_1 = require("./parse-template");
function parseProject() {
    var _a, _b;
    var rootDir = (_a = process_1.argv[2]) !== null && _a !== void 0 ? _a : '/libs';
    var modulePaths = directory_parser_1.getFilesRecursively(rootDir, new RegExp(/module.ts$/), []);
    console.log("processsing " + modulePaths.length + " files");
    var moduleMap = {};
    function processDependencies(ngModule, child) {
        var _a, _b;
        if ((_a = child.dependencies) === null || _a === void 0 ? void 0 : _a.classes) {
            // @ts-ignore
            ngModule.dependencies.classes = __assign(__assign({}, ngModule.dependencies.classes), child.dependencies.classes);
        }
        if ((_b = child.dependencies) === null || _b === void 0 ? void 0 : _b.selectors) {
            // @ts-ignore
            ngModule.dependencies.selectors = __assign(__assign({}, ngModule.dependencies.selectors), child.dependencies.selectors);
        }
    }
    function processProvisions(ngModule, child) {
        if (child.selector) {
            // @ts-ignore
            ngModule.providing.selectors[child.selector] = true;
        }
        if (child.name) {
            // @ts-ignore
            ngModule.providing.classes[child.name] = true;
        }
    }
    function processChild(ngModule, path) {
        var sourceCode = fs_1.readFileSync(path).toString();
        var sourceFile = ts.createSourceFile(path, sourceCode, ts.ScriptTarget.Latest, true);
        var child = parse_child_file_1.parseChildFile(sourceFile);
        child.fileLocation = path;
        // @ts-ignore
        ngModule.children.push(child);
        processDependencies(ngModule, child);
        processProvisions(ngModule, child);
    }
    function processChildren(ngModule, mPath) {
        var childPaths = directory_parser_1.getFilesRecursively(path_1.dirname(mPath), new RegExp(/\.(component|service|helper|directive|pipe).ts$/), []);
        childPaths.forEach(function (path) {
            processChild(ngModule, path);
        });
        processTemplates(ngModule, mPath);
    }
    function processTemplates(ngModule, mPath) {
        var childPaths = directory_parser_1.getFilesRecursively(path_1.dirname(mPath), new RegExp(/\.html$/), []);
        childPaths.forEach(function (path) {
            var html = fs_1.readFileSync(path).toString();
            var child = parse_template_1.parseTemplate(html);
            processDependencies(ngModule, child);
        });
    }
    modulePaths.forEach(function (path) {
        var sourceCode = fs_1.readFileSync(path).toString();
        var sourceFile = ts.createSourceFile(path, sourceCode, ts.ScriptTarget.Latest, true);
        var ngModule = parse_module_file_1.parseModuleFile(sourceFile);
        ngModule.fileLocation = path;
        ngModule.dependencies = {
            classes: {},
            selectors: {}
        };
        ngModule.providing = {
            classes: {},
            selectors: {}
        };
        ngModule.children = [];
        if (ngModule.className)
            moduleMap[ngModule.className] = ngModule;
    });
    for (var className in moduleMap) {
        var mPath = (_b = moduleMap[className].fileLocation) !== null && _b !== void 0 ? _b : '';
        if (mPath && !(mPath === null || mPath === void 0 ? void 0 : mPath.endsWith('routing.module.ts'))) {
            processChildren(moduleMap[className], mPath);
        }
    }
    var providerMap = create_provider_map_1.createProviderMap(moduleMap);
    audit_project_1.auditProject(providerMap, moduleMap);
    fix_project_1.fixProject(moduleMap);
    console.log('processing complete');
    return moduleMap;
}
exports.parseProject = parseProject;
parseProject();
