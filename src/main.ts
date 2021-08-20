#!/usr/bin/env node
import {readFileSync} from "fs";
import {dirname} from "path";
import {argv} from 'process';
import * as ts from "typescript";
import {auditProject} from "./audit-project";
import {fixProject} from "./fix-project";
import { createProviderMap } from "./create-provider-map";
import {getFilesRecursively} from './directory-parser';
import {Module, ModuleChild, ModuleComponent} from './model';
import {parseChildFile} from "./parse-child-file";
import {parseModuleFile} from "./parse-module-file";
import { parseTemplate } from "./parse-template";

export function parseProject(): Record<string, Module> {
    const rootDir = argv[2] ?? '/libs';
    const modulePaths = getFilesRecursively(rootDir, new RegExp(/module.ts$/), []);
    console.log(`processsing ${modulePaths.length} files`);
    const moduleMap: Record<string, Module> = {};

    function processDependencies(ngModule: Module, child: ModuleChild): void {
        if (child.dependencies?.classes) {
            // @ts-ignore

            ngModule.dependencies.classes = {
                // @ts-ignore
                ...ngModule.dependencies.classes,
                ...child.dependencies.classes
            };
        }

        if (child.dependencies?.selectors) {
            // @ts-ignore
            ngModule.dependencies.selectors = {
                // @ts-ignore
                ...ngModule.dependencies.selectors,
                ...child.dependencies.selectors
            };
        }
    }

    function processProvisions(ngModule: Module, child: ModuleChild): void {
        if ((child as ModuleComponent).selector) {
            // @ts-ignore
            ngModule.providing.selectors[(child as ModuleComponent).selector] = true;
        }

        if (child.name) {
            // @ts-ignore
            ngModule.providing.classes[child.name] = true;
        }
    }

    function processChild(ngModule: Module, path: string): void {
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
        ngModule.children.push(child);
        processDependencies(ngModule, child);
        processProvisions(ngModule, child);
    }

    function processChildren(ngModule: Module, mPath: string) {
        let childPaths = getFilesRecursively(dirname(mPath), new RegExp(/\.(component|service|helper|directive|pipe).ts$/), []);
        childPaths.forEach(path => {
            processChild(ngModule, path);
        });
        processTemplates(ngModule, mPath);
    }

    function processTemplates(ngModule: Module, mPath: string) {
        let childPaths = getFilesRecursively(dirname(mPath), new RegExp(/\.html$/), []);
        childPaths.forEach(path => {
            const html = readFileSync(path).toString();
            const child = parseTemplate(html);
            processDependencies(ngModule, child);
        });
    }

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
        ngModule.dependencies = {
            classes: {},
            selectors: {}
        }
        ngModule.providing = {
            classes: {},
            selectors: {}
        }
        ngModule.children = [];
        if (ngModule.className) moduleMap[ngModule.className] = ngModule;
    });
    for (const className in moduleMap) {
        const mPath = moduleMap[className].fileLocation ?? '';
        if (mPath && !mPath?.endsWith('routing.module.ts')) {
            processChildren(moduleMap[className], mPath);
        }

    }

    const providerMap = createProviderMap(moduleMap);
    auditProject(providerMap, moduleMap);
    fixProject(moduleMap);
    console.log('processing complete')
    return moduleMap;
}
parseProject();

