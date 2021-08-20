
export function parseTemplate(template: string): any {

    const results = {
        dependencies: {
            selectors: {}
        }
    };
    const re = new RegExp(/<\/(.+?)>/, 'g');
    const tmpl = template.replace(/\r\n|\r|\n|\s\s/g, ' ')
    let match;
    while ((match = re.exec(tmpl)) !== null) {
        if(match[1].startsWith('app-') || match[1].startsWith('mat-')) {

            // @ts-ignore
            results.dependencies.selectors[match[1].trim()] = true;
        }
    }

    return results;
}

