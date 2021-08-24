import {ImportDeclaration, Module, ModuleChild} from "./model";

export function auditProject(pMap: Record<string, ImportDeclaration>, mMap: Record<string, Module>): Record<string, Module> {
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
                    addMissingModuleError(ngModule, providerMap[dependency]?.importClass, dependency)
                }
            }
        }

        if (ngModule.dependencies?.selectors) {
            for (const dependency in ngModule.dependencies.selectors) {
                if (!isModuleImported(ngModule, dependency)) {
                    addMissingModuleError(ngModule, providerMap[dependency]?.importClass, dependency)
                }
            }
        }
    }

    function isModuleImported(ngModule: Module, key: string): boolean {
        const moduleName = providerMap[key]?.importClass;
        if (moduleName === '*' || moduleName === ngModule.className) return true;
        // @ts-ignore
        const found = ngModule.imports.find(d => d.importClass === moduleName);
        if (found) return true;
        return false
    }

    function addMissingModuleError(ngModule: Module, requiredModuleName: string, dependency: string) {

        if (unique[requiredModuleName]) return;
        ngModule.missingModules.push({
            classname: requiredModuleName,
            importClause: providerMap[requiredModuleName]
        });
        unique[requiredModuleName] = true;
        console.log(`MODULE: ${ngModule.className} requires ${requiredModuleName} for ${dependency}`)
    }

    function checkMissingImports(ngModule: Module) {
        unique = {};
        ngModule.children?.forEach(child => {
            checkMissingImportsForChild(child);
        })
    }

    function checkMissingImportsForChild(child: ModuleChild) {
        for(const dClass in child.dependencies.classes ) {
                if (!child.imports.find(i => i.importClass === dClass)) {
                    const provider = providerMap[dClass];
                    if (provider && !unique[provider.importClass] && child.name !== dClass) {
                        const ic =
                            {
                                classname: dClass,
                                importClause: provider,
                                modulename: provider.importClass
                            }
                            if(provider.importClass === 'SharedModelModule') {
                                ic.importClause.importClass = dClass;
                            }
                        child.missingClasses.push(ic);
                        unique[provider.importClass] = true;
                        console.log(`COMPONENT: ${child.name} requires "${ic.importClause.importLib}" for ${dClass}`)
                    }
                }
        }
    }
}

