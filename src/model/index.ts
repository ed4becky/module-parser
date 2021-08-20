
export interface Module {
    className: string;
    imports?: ImportDeclaration[];
    fileLocation: string;
    importClause?: ImportDeclaration;
    ngDeclaractions?: string[];
    ngExports?: string[];
    ngImports?: string[];
    dependencies?: Dependency;
    children?: ModuleChild[];
    missingModules?: MissingModule[];
    providing?: Providing;
}

export interface Dependency {
    classes: any;
    selectors?: any
}

export interface Providing {
    classes: any;
    selectors?: any
}

export interface ModuleChild {
    name: string;
    fileLocation: string
    dependencies: Dependency;
    imports: ImportDeclaration[];
    missingClasses?: MissingClass[];
};

export interface ImportDeclaration {
    importClass: string;
    importLib?: string;
}

export interface ModuleComponent extends ModuleChild {
    selector?: string;
}

export interface ModuleService extends ModuleChild {}

export interface ModuleDirective extends ModuleChild {}

export interface ModulePipe extends ModuleChild {}

export interface ModuleTemplate extends ModuleChild {}

export interface MissingModule {
    classname: string;
    importClause: ImportDeclaration;
}

export interface MissingClass extends MissingModule {
    modulename: string;
}
