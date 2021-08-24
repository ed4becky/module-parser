import {dirname} from "path";
import {ImportDeclaration, Module} from "./model/index";
import { ProviderMap } from "./static-provider-map";

export function createProviderMap(moduleMap: Record<string, Module>): any {

    const results:Record<string, ImportDeclaration> = { ...ProviderMap };
    for (const key in moduleMap) {
        const ngModule = moduleMap[key];

        if(ngModule.providing?.classes) {
            for (const provided in ngModule.providing.classes) {
                results[provided] = getImportClause(key);
            }
        }

        if(ngModule.providing?.selectors) {
            for (const provided in ngModule.providing.selectors) {
                results[provided] = getImportClause(key);
            }
        }
    }

    return results;

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
}

