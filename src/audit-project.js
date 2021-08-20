"use strict";
exports.__esModule = true;
exports.auditProject = void 0;
var path_1 = require("path");
function auditProject(pMap, mMap) {
    var providerMap = pMap;
    var moduleMap = mMap;
    var unique;
    for (var key in moduleMap) {
        var ngModule = moduleMap[key];
        checkMissingModules(ngModule);
        checkMissingImports(ngModule);
    }
    return moduleMap;
    function checkMissingModules(ngModule) {
        var _a, _b;
        unique = {};
        if ((_a = ngModule.dependencies) === null || _a === void 0 ? void 0 : _a.classes) {
            for (var dependency in ngModule.dependencies.classes) {
                if (!dependency.endsWith('Service') && !isModuleImported(ngModule, dependency)) {
                    addMissingModuleError(ngModule, providerMap[dependency], dependency);
                }
            }
        }
        if ((_b = ngModule.dependencies) === null || _b === void 0 ? void 0 : _b.selectors) {
            for (var dependency in ngModule.dependencies.selectors) {
                if (!isModuleImported(ngModule, dependency)) {
                    addMissingModuleError(ngModule, providerMap[dependency], dependency);
                }
            }
        }
    }
    function isModuleImported(ngModule, key) {
        var moduleName = providerMap[key];
        if (moduleName === '*' || moduleName === ngModule.className)
            return true;
        // @ts-ignore
        var found = ngModule.imports.find(function (d) { return d.importClass === moduleName; });
        if (found)
            return true;
        return false;
    }
    function addMissingModuleError(ngModule, requiredModuleName, dependency) {
        var _a;
        ngModule.missingModules = (_a = ngModule.missingModules) !== null && _a !== void 0 ? _a : [];
        if (unique[requiredModuleName])
            return;
        ngModule.missingModules.push({
            classname: requiredModuleName,
            importClause: getImportClause(requiredModuleName)
        });
        unique[requiredModuleName] = true;
        console.log("MODULE: " + ngModule.className + " requires " + requiredModuleName + " for " + dependency);
    }
    function getImportClause(requiredModuleName) {
        var _a;
        if (!requiredModuleName)
            return {
                importClass: 'undefined',
                importLib: ''
            };
        if (!moduleMap[requiredModuleName] || requiredModuleName.startsWith('Mat'))
            return {
                importClass: requiredModuleName,
                importLib: ''
            };
        if (!((_a = moduleMap[requiredModuleName]) === null || _a === void 0 ? void 0 : _a.importClause)) {
            buildImportClause(requiredModuleName);
        }
        // @ts-ignore
        return moduleMap[requiredModuleName].importClause;
    }
    function buildImportClause(requiredModuleName) {
        // @ts-ignore
        var location = path_1.dirname(moduleMap[requiredModuleName].fileLocation);
        // @ts-ignore
        var importLib = '@netfoundry-ui/' + location
            .replace(/[\\\\|\\]/g, '/')
            .replace(/^.*libs\//, '')
            .replace(/\/src\/lib/, '');
        moduleMap[requiredModuleName].importClause = {
            importClass: requiredModuleName,
            importLib: importLib
        };
    }
    function checkMissingImports(ngModule) {
        var _a;
        unique = {};
        (_a = ngModule.children) === null || _a === void 0 ? void 0 : _a.forEach(function (child) {
            checkMissingImportsForChild(child);
        });
    }
    function checkMissingImportsForChild(child) {
        var _a;
        // @ts-ignore
        child.missingClasses = (_a = child.missingClasses) !== null && _a !== void 0 ? _a : [];
        var _loop_1 = function (dClass) {
            if (!child.imports.find(function (i) { return i.importClass === dClass; })) {
                var provider = providerMap[dClass];
                if (provider && !unique[provider] && child.name !== dClass) {
                    var ic = {
                        classname: dClass,
                        importClause: getImportClause(provider),
                        modulename: provider
                    };
                    if (provider === 'SharedModelModule') {
                        ic.importClause.importClass = dClass;
                    }
                    child.missingClasses.push(ic);
                    unique[provider] = true;
                    console.log("COMPONENT: " + child.name + " requires \"" + ic.importClause.importLib + "\" for " + dClass);
                }
            }
        };
        for (var dClass in child.dependencies.classes) {
            _loop_1(dClass);
        }
    }
}
exports.auditProject = auditProject;
