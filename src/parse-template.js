"use strict";
exports.__esModule = true;
exports.parseTemplate = void 0;
function parseTemplate(template) {
    var results = {
        dependencies: {
            selectors: {}
        }
    };
    var re = new RegExp(/<\/(.+?)>/, 'g');
    var tmpl = template.replace(/\r\n|\r|\n|\s\s/g, ' ');
    var match;
    while ((match = re.exec(tmpl)) !== null) {
        if (match[1].startsWith('app-') || match[1].startsWith('mat-')) {
            // @ts-ignore
            results.dependencies.selectors[match[1].trim()] = true;
        }
    }
    return results;
}
exports.parseTemplate = parseTemplate;
