import * as fs from "fs";
import * as path from "path";


export const getFilesRecursively = (directory: string, re: RegExp, files: string[]) => {
    const filesInDirectory = fs.readdirSync(directory);
    for (const file of filesInDirectory) {
        const absolute = path.join(directory, file);
        if (fs.statSync(absolute).isDirectory()
            && absolute.indexOf('node_modules') < 0) {
            getFilesRecursively(absolute, re, files);
        } else if (re.test(absolute)) {
            //console.log(absolute)
            files.push(absolute);
        }
    }
    return files;
};
