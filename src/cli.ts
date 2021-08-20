#!/usr/bin/env node
import {readFileSync} from "fs";
import {dirname} from "path";
import {argv} from 'process';
import * as ts from "typescript";
import {getFilesRecursively} from './directory-parser';
import {Module, ModuleChild} from './model';
import {parseChildFile} from "./parse-child-file";
import {parseModuleFile} from "./parse-module-file";

const rootDir = argv[2] ?? '/libs';
const modulePaths = getFilesRecursively(rootDir, new RegExp(/module.ts$/), []);
console.log(`processsing ${modulePaths.length} files`);
const moduleMap: Record<string, Module> = {};

modulePaths.forEach(path => {
    const sourceCode = readFileSync(path).toString();
    const sourceFile = ts.createSourceFile(
        path,
        sourceCode,
        ts.ScriptTarget.Latest,
        true
    );
    const ngModule: Module = parseModuleFile(sourceFile);
    ngModule.fileLocation = path;
    if (ngModule.className) moduleMap[ngModule.className] = ngModule;
});
//console.log(JSON.stringify(moduleMap, null, 2));
for (const className in moduleMap) {
    //console.log('processing ' + moduleMap[className].fileLocation)
    moduleMap[className].children = moduleMap[className].children ?? [];
    const mPath = moduleMap[className].fileLocation ?? '';
    if (mPath && !mPath?.endsWith('routing.module.ts')) {
        let childPaths = getFilesRecursively(dirname(mPath), new RegExp(/\.(component|service|helper|directive|pipe).ts$/), []);
        childPaths.forEach(path => {
            const sourceCode = readFileSync(path).toString();
            const sourceFile = ts.createSourceFile(
                path,
                sourceCode,
                ts.ScriptTarget.Latest,
                true
            );
            const child: ModuleChild = parseChildFile(sourceFile);
            child.fileLocation = path;
            // @ts-ignore
            moduleMap[className].children.push(child);
        });
    }

}

console.log('processing complete')




