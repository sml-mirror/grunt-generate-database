"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const nunjucks_1 = require("nunjucks");
const options_1 = require("./model/options");
const schema_1 = require("./model/schema");
const table_1 = require("./model/table");
const declaration_1 = require("./model/declaration");
const ts_file_parser_1 = require("ts-file-parser");
const path = require("path");
function CreateFileForTableCreate(datas, options, historyStruct, schema) {
    let scriptFolder = path.resolve(__dirname, "view/");
    nunjucks_1.configure(scriptFolder, { autoescape: true, trimBlocks: true });
    var rendererTemplate = nunjucks_1.render("createBaseTemplate.njk", { data: datas, options: options.dbOptions,
        historyPath: options.pathToHistoryFromGeneratedModel, basePath: options.baseModelPathFromGeneratedModel, schema: schema });
    if (rendererTemplate && rendererTemplate.trim()) {
        var fs = require("fs");
        var mkdirp = require("mkdirp");
        var getDirName = require("path").dirname;
        var fileName = options.destinationDB + "/" + datas.name + "/" + schema.namespace + "/" + "schema.ts";
        mkdirp.sync(getDirName(fileName));
        fs.writeFileSync(fileName, rendererTemplate, "utf-8");
    }
}
function CreateFileForTriggersCreateForSchema(datas, options, historyStruct, schema) {
    let scriptFolder = path.resolve(__dirname, "view/");
    nunjucks_1.configure(scriptFolder, { autoescape: true, trimBlocks: true });
    var rendererTemplate = nunjucks_1.render("createTriggerFunctionTemplate.njk", { data: datas, options: options.dbOptions, hStr: historyStruct,
        schema: schema });
    if (rendererTemplate && rendererTemplate.trim()) {
        var fs = require("fs");
        var mkdirp = require("mkdirp");
        var getDirName = require("path").dirname;
        var fileName = options.destinationDB + "/" + datas.name + "/" + schema.namespace + "/" + "function.ts";
        mkdirp.sync(getDirName(fileName));
        fs.writeFileSync(fileName, rendererTemplate, "utf-8");
    }
    nunjucks_1.configure(scriptFolder, { autoescape: true, trimBlocks: true });
    rendererTemplate = nunjucks_1.render("createTriggerTemplate.njk", { data: datas, options: options.dbOptions,
        historyPath: options.pathToHistoryFromGeneratedModel, schema: schema });
    if (rendererTemplate && rendererTemplate.trim()) {
        fs = require("fs");
        mkdirp = require("mkdirp");
        getDirName = require("path").dirname;
        fileName = options.destinationDB + "/" + datas.name + "/" + schema.namespace + "/" + "trigger.ts";
        mkdirp.sync(getDirName(fileName));
        fs.writeFileSync(fileName, rendererTemplate, "utf-8");
    }
}
function CreateDBCreator(options, jsonDeclaration) {
    let scriptFolder = path.resolve(__dirname, "view/");
    nunjucks_1.configure(scriptFolder, { autoescape: true, trimBlocks: true });
    var rendererTemplate = nunjucks_1.render("createDBTemplate.njk", { scriptsDestination: options.destinationDB, declaration: jsonDeclaration });
    if (rendererTemplate && rendererTemplate.trim()) {
        var fs = require("fs");
        var mkdirp = require("mkdirp");
        var getDirName = require("path").dirname;
        var fileName = options.destinationDB + "/generateDB.ts";
        mkdirp.sync(getDirName(fileName));
        fs.writeFileSync(fileName, rendererTemplate, "utf-8");
    }
}
function CreateDbSCriptsInternal(options) {
    var fs = require("fs");
    var declaration = fs.readFileSync(options.pathToDeclaration, "utf-8");
    var jsonDeclarationObj = JSON.parse(declaration);
    let jsonDeclaration = new Array();
    for (let index = 0; index < jsonDeclarationObj.length; index++) {
        let declrtion = new declaration_1.Declaration();
        declrtion.dbtype = jsonDeclarationObj[index].dbtype;
        declrtion.dbusername = jsonDeclarationObj[index].dbusername;
        declrtion.dbdatabase = jsonDeclarationObj[index].dbdatabase;
        declrtion.dbhost = jsonDeclarationObj[index].dbhost;
        declrtion.dbpassword = jsonDeclarationObj[index].dbpassword;
        declrtion.dbport = jsonDeclarationObj[index].dbport;
        declrtion.name = jsonDeclarationObj[index].name;
        let schms = new Array();
        jsonDeclarationObj[index].schemas.forEach(schema => {
            let schm = new schema_1.Schema();
            schm.tables = new Array();
            schm.namespace = schema.namespace;
            schema.tables.forEach(table => {
                let tble = new table_1.Table();
                tble.name = table.name;
                tble.isHistoried = table.isHistoried;
                tble.pathToModel = table.pathToModel;
                schm.tables.push(tble);
            });
            schms.push(schm);
        });
        declrtion.schemas = schms;
        jsonDeclaration.push(declrtion);
    }
    var stringFile = "";
    var globalStringFile = "";
    for (let index = 0; index < jsonDeclaration.length; index++) {
        stringFile = "";
        let schms = jsonDeclaration[index].schemas;
        for (var innerIndex = 0; innerIndex < schms.length; innerIndex++) {
            for (var tableIndex = 0; tableIndex < schms[innerIndex].tables.length; tableIndex++) {
                var table = schms[innerIndex].tables[tableIndex];
                var pathtobaseModel = options.baseModelPath + table.pathToModel + ".ts";
                stringFile += fs.readFileSync(pathtobaseModel, "utf-8");
                if (options.pathToHistory) {
                    var pathtoHistory = options.pathToHistory + table.pathToModel + ".ts";
                    stringFile += fs.readFileSync(pathtoHistory, "utf-8");
                }
            }
            var jsonStructure = ts_file_parser_1.parseStruct(stringFile, {}, "");
            CreateFileForTableCreate(jsonDeclaration[index], options, jsonStructure, schms[innerIndex]);
            CreateFileForTriggersCreateForSchema(jsonDeclaration[index], options, jsonStructure, schms[innerIndex]);
            stringFile = "";
        }
    }
    CreateDBCreator(options, jsonDeclaration);
}
exports.CreateDbSCriptsInternal = CreateDbSCriptsInternal;
function CreateInitOptionsByGrunt(grunt) {
    let opt = new options_1.Options();
    let dbOptions = new options_1.DbOptions();
    dbOptions.type = process.env.dbtype;
    dbOptions.host = process.env.dbhost;
    dbOptions.port = process.env.dbport;
    dbOptions.username = process.env.dbusername;
    dbOptions.password = process.env.dbpassword;
    dbOptions.database = process.env.dbdatabase;
    dbOptions.reCreate = grunt.task.current.data.reCreate;
    opt.dbOptions = dbOptions;
    opt.pathToDeclaration = grunt.task.current.data.pathToDeclaration;
    opt.baseModelPath = grunt.task.current.data.baseModelPath;
    opt.destinationDB = grunt.task.current.data.destinationDB;
    opt.pathToHistory = grunt.task.current.data.pathToHistory;
    opt.pathToHistoryFromGeneratedModel = grunt.task.current.data.pathToHistoryFromGeneratedModel;
    opt.baseModelPathFromGeneratedModel = grunt.task.current.data.baseModelPathFromGeneratedModel;
    return opt;
}
exports.CreateInitOptionsByGrunt = CreateInitOptionsByGrunt;
//# sourceMappingURL=createDbScripts.js.map