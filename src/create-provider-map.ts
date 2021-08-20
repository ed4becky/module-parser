import {Module} from "./model/index";
import { ProviderMap } from "./static-provider-map";

export function createProviderMap(moduleMap: Record<string, Module>): any {

    const results:Record<string, string> = { ...ProviderMap };
    for (const key in moduleMap) {
        const ngModule = moduleMap[key];

        if(ngModule.providing?.classes) {
            for (const provided in ngModule.providing.classes) {
                // @ts-ignore
                results[provided] = ngModule.className;
            }
        }

        if(ngModule.providing?.selectors) {
            for (const provided in ngModule.providing.selectors) {
                // @ts-ignore
                results[provided] = ngModule.className;
            }
        }
    }

    return results;
}

