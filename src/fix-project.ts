import {readFileSync} from "fs";
import * as ts from "typescript";
import {Module } from "./model";
import { HostTree } from '@angular-devkit/schematics';
import { InsertChange } from '@schematics/angular/utility/change';
import {
    addImportToModule,
} from '@schematics/angular/utility/ast-utils';
import * as fs from 'fs';

export function fixProject( moduleMap: Record<string, Module>): Record<string, Module> {
    let sourceFile;
    let tree;
    for (const key in moduleMap) {
        const ngModule = moduleMap[key];
        if(ngModule.missingModules && ngModule.missingModules.length > 0) {
            const sourceCode = readFileSync(ngModule.fileLocation).toString();
            sourceFile = ts.createSourceFile(
                ngModule.fileLocation,
                sourceCode,
                ts.ScriptTarget.Latest,
                true
            );
            tree = new HostTree();
            tree.create(ngModule.fileLocation, sourceCode);
            tree = fixMissingModules(sourceFile, tree, ngModule);
            // @ts-ignore
            fs.writeFileSync(ngModule.fileLocation, tree.get(ngModule.fileLocation).content.toString())
        }
    }

    return moduleMap;

    function fixMissingModules(sourceFile: ts.SourceFile, tree: HostTree, ngModule: Module): HostTree {
        const updateRecorder = tree.beginUpdate(ngModule.fileLocation);
        ngModule.missingModules?.forEach(mm => {
            if(mm.classname !== 'undefined') {
                const changes =
                    addImportToModule(
                        sourceFile,
                        ngModule.fileLocation,
                        mm.classname ?? ' ',
                        mm.importClause?.importLib ?? ' ',
                    ) as InsertChange[];
                for (const change of changes) {
                    if (change instanceof InsertChange) {
                        updateRecorder.insertLeft(change.pos, change.toAdd);
                    }
                }
            }
        });

        tree.commitUpdate(updateRecorder);
        return tree;
    }

}




