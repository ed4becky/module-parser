import {ImportDeclaration, Module, ModuleChild} from "./model";
import {dirname} from "path";


export function auditProject(pMap: Record<string, string>, mMap: Record<string, Module>): Record<string, Module> {
    const providerMap = pMap;
    const moduleMap = mMap
    let unique: any;

    for (const key in moduleMap) {
        const ngModule = moduleMap[key];
        checkMissingModules(ngModule);
        checkMissingImports(ngModule);
    }

    return moduleMap;

    function checkMissingModules(ngModule: Module) {
        unique = {};
        if (ngModule.dependencies?.classes) {
            for (const dependency in ngModule.dependencies.classes) {
                if (!dependency.endsWith('Service') && !isModuleImported(ngModule, dependency)) {
                    addMissingModuleError(ngModule, providerMap[dependency], dependency)
                }
            }
        }

        if (ngModule.dependencies?.selectors) {
            for (const dependency in ngModule.dependencies.selectors) {
                if (!isModuleImported(ngModule, dependency)) {
                    addMissingModuleError(ngModule, providerMap[dependency], dependency)
                }
            }
        }
    }

    function isModuleImported(ngModule: Module, key: string): boolean {
        const moduleName = providerMap[key];
        if (moduleName === '*' || moduleName === ngModule.className) return true;
        // @ts-ignore
        const found = ngModule.imports.find(d => d.importClass === moduleName);
        if (found) return true;
        return false
    }

    function addMissingModuleError(ngModule: Module, requiredModuleName: string, dependency: string) {

        ngModule.missingModules = ngModule.missingModules ?? [];
        if (unique[requiredModuleName]) return;
        ngModule.missingModules.push({
            classname: requiredModuleName,
            importClause: getImportClause(requiredModuleName)
        });
        unique[requiredModuleName] = true;
        console.log(`MODULE: ${ngModule.className} requires ${requiredModuleName} for ${dependency}`)
    }

    function getImportClause(requiredModuleName: string): ImportDeclaration {
        if(!requiredModuleName) return {
            importClass: 'undefined',
            importLib: ''
        }
        if (!moduleMap[requiredModuleName] ||requiredModuleName.startsWith('Mat')) return {
            importClass: requiredModuleName,
            importLib: ''
        };
        if (!moduleMap[requiredModuleName]?.importClause) {
            buildImportClause(requiredModuleName);
        }
        // @ts-ignore
        return moduleMap[requiredModuleName].importClause;
    }

    function buildImportClause(requiredModuleName: string) {
        // @ts-ignore
        const location = dirname(moduleMap[requiredModuleName].fileLocation);
        // @ts-ignore
        const importLib = '@netfoundry-ui/' + location
            .replace(/[\\\\|\\]/g, '/')
            .replace(/^.*libs\//, '')
            .replace(/\/src\/lib/, '')
        moduleMap[requiredModuleName].importClause = {
            importClass: requiredModuleName,
            importLib: importLib
        }
    }

    function checkMissingImports(ngModule: Module) {
        unique = {};
        ngModule.children?.forEach(child => {
            checkMissingImportsForChild(child);
        })
    }

    function checkMissingImportsForChild(child: ModuleChild) {
        // @ts-ignore
        child.missingClasses = child.missingClasses ?? [];

        for(const dClass in child.dependencies.classes ) {
                if (!child.imports.find(i => i.importClass === dClass)) {
                    const provider = providerMap[dClass];
                    if (provider && !unique[provider] && child.name !== dClass) {
                        const ic =
                            {
                                classname: dClass,
                                importClause: getImportClause(provider),
                                modulename: provider
                            }
                            if(provider === 'SharedModelModule') {
                                ic.importClause.importClass = dClass;
                            }
                        child.missingClasses.push(ic);
                        unique[provider] = true;
                        console.log(`COMPONENT: ${child.name} requires "${ic.importClause.importLib}" for ${dClass}`)
                    }
                }
        }
    }
}

