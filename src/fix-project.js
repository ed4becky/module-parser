"use strict";
exports.__esModule = true;
exports.fixProject = void 0;
var fs_1 = require("fs");
var ts = require("typescript");
var schematics_1 = require("@angular-devkit/schematics");
var change_1 = require("@schematics/angular/utility/change");
var ast_utils_1 = require("@schematics/angular/utility/ast-utils");
var fs = require("fs");
function fixProject(moduleMap) {
    var sourceFile;
    var tree;
    for (var key in moduleMap) {
        var ngModule = moduleMap[key];
        if (ngModule.missingModules && ngModule.missingModules.length > 0) {
            var sourceCode = fs_1.readFileSync(ngModule.fileLocation).toString();
            sourceFile = ts.createSourceFile(ngModule.fileLocation, sourceCode, ts.ScriptTarget.Latest, true);
            tree = new schematics_1.HostTree();
            tree.create(ngModule.fileLocation, sourceCode);
            tree = fixMissingModules(sourceFile, tree, ngModule);
            // @ts-ignore
            fs.writeFileSync(ngModule.fileLocation, tree.get(ngModule.fileLocation).content.toString());
        }
    }
    return moduleMap;
    function fixMissingModules(sourceFile, tree, ngModule) {
        var _a;
        var updateRecorder = tree.beginUpdate(ngModule.fileLocation);
        (_a = ngModule.missingModules) === null || _a === void 0 ? void 0 : _a.forEach(function (mm) {
            var _a, _b, _c;
            if (mm.classname !== 'undefined') {
                var changes = ast_utils_1.addImportToModule(sourceFile, ngModule.fileLocation, (_a = mm.classname) !== null && _a !== void 0 ? _a : ' ', (_c = (_b = mm.importClause) === null || _b === void 0 ? void 0 : _b.importLib) !== null && _c !== void 0 ? _c : ' ');
                for (var _i = 0, changes_1 = changes; _i < changes_1.length; _i++) {
                    var change = changes_1[_i];
                    if (change instanceof change_1.InsertChange) {
                        updateRecorder.insertLeft(change.pos, change.toAdd);
                    }
                }
            }
        });
        tree.commitUpdate(updateRecorder);
        return tree;
    }
}
exports.fixProject = fixProject;
