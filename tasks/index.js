"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const nunjucks_1 = require("nunjucks");
const options_1 = require("./model/options");
const ts_structure_parser_1 = require("ts-structure-parser");
const path = require("path");
function generateDatabase(grunt) {
    grunt.registerMultiTask("generateDatabase", function () {
        let dbOptions = new options_1.DbOptions();
        dbOptions.type = process.env.dbtype;
        dbOptions.host = process.env.dbhost;
        dbOptions.port = process.env.dbport;
        dbOptions.username = process.env.dbusername;
        dbOptions.password = process.env.dbpassword;
        dbOptions.database = process.env.dbdatabase;
        dbOptions.reCreate = this.data.reCreate;
        dbOptions.declarationPath = this.data.pathToDeclaration;
        var declaration = grunt.file.read(this.data.pathToDeclaration);
        var jsonDeclaration = JSON.parse(declaration);
        var options = this.options({
            encoding: grunt.file.defaultEncoding,
            processContent: false,
            processContentExclude: [],
            timestamp: false,
            mode: false
        });
        var stringFile = "";
        var globalStringFile = "";
        for (var index = 0; index < jsonDeclaration.length; index++) {
            var schms = jsonDeclaration[index].schemas;
            stringFile = "";
            for (var innerIndex = 0; innerIndex < schms.length; innerIndex++) {
                for (var tableIndex = 0; tableIndex < schms[innerIndex].tables.length; tableIndex++) {
                    var table = schms[innerIndex].tables[tableIndex];
                    var pathtobaseModel = this.data.baseModelPath + table.pathToModel + ".ts";
                    stringFile += grunt.file.read(pathtobaseModel, options);
                    var pathtoHistory = this.data.pathToHistory + table.pathToModel + ".ts";
                    stringFile += grunt.file.read(this.data.pathToHistory + table.pathToModel + ".ts", options);
                }
                var jsonStructure = ts_structure_parser_1.parseStruct(stringFile, {}, "");
                CreateFileForTableCreate(jsonDeclaration[index], dbOptions, grunt, this.data, jsonStructure, schms[innerIndex]);
                CreateFileForTriggersCreateForSchema(jsonDeclaration[index], dbOptions, grunt, this.data, jsonStructure, schms[innerIndex]);
                stringFile = "";
            }
        }
        CreateDBCreator(grunt, this.data, jsonDeclaration);
    });
}
module.exports = generateDatabase;
function CreateOtherFile(jsonDeclaration, pathes, grunt) {
    let scriptFolder = path.resolve(__dirname, "view/");
    nunjucks_1.configure(scriptFolder, { autoescape: true, trimBlocks: true });
    var rendererTemplate = nunjucks_1.render("createTablesTemplate.njk", { declaration: jsonDeclaration,
        basePath: pathes.destinationDB });
    if (rendererTemplate && rendererTemplate.trim()) {
        grunt.file.write(pathes.destinationDB + "generateDB.ts", rendererTemplate);
    }
}
function CreateFileForTableCreate(datas, dboptions, grunt, pathes, historyStruct, schema) {
    let scriptFolder = path.resolve(__dirname, "view/");
    nunjucks_1.configure(scriptFolder, { autoescape: true, trimBlocks: true });
    var rendererTemplate = nunjucks_1.render("createBaseTemplate.njk", { data: datas, options: dboptions,
        historyPath: pathes.pathToHistory, basePath: pathes.baseModelPath, schema: schema });
    if (rendererTemplate && rendererTemplate.trim()) {
        grunt.file.write(pathes.destinationDB + "/" + datas.name + "/" + schema.namespace + "/" + "schema.ts", rendererTemplate);
    }
}
function CreateFileForTriggersCreateForSchema(datas, dboptions, grunt, pathes, historyStruct, schema) {
    let scriptFolder = path.resolve(__dirname, "view/");
    nunjucks_1.configure(scriptFolder, { autoescape: true, trimBlocks: true });
    var rendererTemplate = nunjucks_1.render("createTriggerFunctionTemplate.njk", { data: datas, options: dboptions, hStr: historyStruct,
        historyPath: pathes.pathToHistory, schema: schema });
    if (rendererTemplate && rendererTemplate.trim()) {
        grunt.file.write(pathes.destinationDB + "/" + datas.name + "/" + schema.namespace + "/" + "function.ts", rendererTemplate);
    }
    nunjucks_1.configure(scriptFolder, { autoescape: true, trimBlocks: true });
    rendererTemplate = nunjucks_1.render("createTriggerTemplate.njk", { data: datas, options: dboptions, historyPath: pathes.pathToHistory, schema: schema });
    if (rendererTemplate && rendererTemplate.trim()) {
        grunt.file.write(pathes.destinationDB + "/" + datas.name + "/" + schema.namespace + "/" + "trigger.ts", rendererTemplate);
    }
}
function CreateDBCreator(grunt, pathes, jsonDeclaration) {
    let scriptFolder = path.resolve(__dirname, "view/");
    nunjucks_1.configure(scriptFolder, { autoescape: true, trimBlocks: true });
    var rendererTemplate = nunjucks_1.render("createDBTemplate.njk", { scriptsDestination: pathes.destinationDB, declaration: jsonDeclaration });
    if (rendererTemplate && rendererTemplate.trim()) {
        grunt.file.write(pathes.destinationDB + "/generateDB.ts", rendererTemplate);
    }
}
//# sourceMappingURL=index.js.map