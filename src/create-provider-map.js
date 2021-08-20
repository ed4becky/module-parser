"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.createProviderMap = void 0;
var static_provider_map_1 = require("./static-provider-map");
function createProviderMap(moduleMap) {
    var _a, _b;
    var results = __assign({}, static_provider_map_1.ProviderMap);
    for (var key in moduleMap) {
        var ngModule = moduleMap[key];
        if ((_a = ngModule.providing) === null || _a === void 0 ? void 0 : _a.classes) {
            for (var provided in ngModule.providing.classes) {
                // @ts-ignore
                results[provided] = ngModule.className;
            }
        }
        if ((_b = ngModule.providing) === null || _b === void 0 ? void 0 : _b.selectors) {
            for (var provided in ngModule.providing.selectors) {
                // @ts-ignore
                results[provided] = ngModule.className;
            }
        }
    }
    return results;
}
exports.createProviderMap = createProviderMap;
