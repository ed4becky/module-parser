#!/usr/bin/env node
"use strict";
var _a, _b, _c;
exports.__esModule = true;
var fs_1 = require("fs");
var path_1 = require("path");
var process_1 = require("process");
var ts = require("typescript");
var directory_parser_1 = require("./directory-parser");
var parse_child_file_1 = require("./parse-child-file");
var parse_module_file_1 = require("./parse-module-file");
var rootDir = (_a = process_1.argv[2]) !== null && _a !== void 0 ? _a : '/libs';
var modulePaths = directory_parser_1.getFilesRecursively(rootDir, new RegExp(/module.ts$/), []);
console.log("processsing " + modulePaths.length + " files");
var moduleMap = {};
modulePaths.forEach(function (path) {
    var sourceCode = fs_1.readFileSync(path).toString();
    var sourceFile = ts.createSourceFile(path, sourceCode, ts.ScriptTarget.Latest, true);
    var ngModule = parse_module_file_1.parseModuleFile(sourceFile);
    ngModule.fileLocation = path;
    if (ngModule.className)
        moduleMap[ngModule.className] = ngModule;
});
var _loop_1 = function (className) {
    //console.log('processing ' + moduleMap[className].fileLocation)
    moduleMap[className].children = (_b = moduleMap[className].children) !== null && _b !== void 0 ? _b : [];
    var mPath = (_c = moduleMap[className].fileLocation) !== null && _c !== void 0 ? _c : '';
    if (mPath && !(mPath === null || mPath === void 0 ? void 0 : mPath.endsWith('routing.module.ts'))) {
        var childPaths = directory_parser_1.getFilesRecursively(path_1.dirname(mPath), new RegExp(/\.(component|service|helper|directive|pipe).ts$/), []);
        childPaths.forEach(function (path) {
            var sourceCode = fs_1.readFileSync(path).toString();
            var sourceFile = ts.createSourceFile(path, sourceCode, ts.ScriptTarget.Latest, true);
            var child = parse_child_file_1.parseChildFile(sourceFile);
            child.fileLocation = path;
            // @ts-ignore
            moduleMap[className].children.push(child);
        });
    }
};
//console.log(JSON.stringify(moduleMap, null, 2));
for (var className in moduleMap) {
    _loop_1(className);
}
console.log('processing complete');
