
export class Module {
    className: string = '';
    imports: ImportDeclaration[] = [];
    fileLocation: string = '';
    importClause: ImportDeclaration = new ImportDeclaration();
    ngDeclaractions: string[] = [ ];
    ngExports: string[] = [];
    ngImports: string[] = [ ];
    dependencies: Dependency = new Dependency();
    children: ModuleChild[] = [];
    missingModules: MissingModule[] = [];
    providing: Providing = new Providing();
}

export class Dependency {
    classes: any = {};
    selectors: any = {}
}

export class Providing {
    classes: any = {};
    selectors: any = {}
}

export class ModuleChild {
    name: string = '';
    fileLocation: string = ''
    dependencies: Dependency = new Dependency();
    imports: ImportDeclaration[] = [];
    missingClasses: MissingClass[] = [];
};

export class ImportDeclaration {
    importClass: string = '';
    importLib: string = '';
}

export class ModuleComponent extends ModuleChild {
    selector: string = '';
}

export class ModuleService extends ModuleChild {}

export class ModuleDirective extends ModuleChild {}

export class ModulePipe extends ModuleChild {}

export class ModuleTemplate extends ModuleChild {}

export class MissingModule {
    classname: string = '';
    importClause: ImportDeclaration = new ImportDeclaration();
}

export class MissingClass extends MissingModule {
    modulename: string = '';
}
