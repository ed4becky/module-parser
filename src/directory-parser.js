"use strict";
exports.__esModule = true;
exports.getFilesRecursively = void 0;
var fs = require("fs");
var path = require("path");
var getFilesRecursively = function (directory, re, files) {
    var filesInDirectory = fs.readdirSync(directory);
    for (var _i = 0, filesInDirectory_1 = filesInDirectory; _i < filesInDirectory_1.length; _i++) {
        var file = filesInDirectory_1[_i];
        var absolute = path.join(directory, file);
        if (fs.statSync(absolute).isDirectory()
            && absolute.indexOf('node_modules') < 0) {
            exports.getFilesRecursively(absolute, re, files);
        }
        else if (re.test(absolute)) {
            //console.log(absolute)
            files.push(absolute);
        }
    }
    return files;
};
exports.getFilesRecursively = getFilesRecursively;
