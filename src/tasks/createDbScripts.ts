import "reflect-metadata";
import {createConnection, ConnectionOptions} from "typeorm";
import {render, renderString, configure} from "nunjucks";
import {DbOptions, Options} from "./model/options";
import {Schema} from "./model/schema";
import {Table} from "./model/table";
import {Declaration} from "./model/declaration";
import {parseStruct, Module} from "ts-file-parser";
import * as path from "path";

function CreateFileForTableCreate(datas: Declaration, options: Options, historyStruct: Module, schema: Schema): void {
    let scriptFolder = path.resolve(__dirname, "view/");
    configure(scriptFolder, {autoescape: true, trimBlocks: true});
    var rendererTemplate = render("createBaseTemplate.njk", {data: datas, options: options.dbOptions,
        historyPath: options.pathToHistoryFromGeneratedModel, basePath: options.baseModelPathFromGeneratedModel, schema: schema});
    if (rendererTemplate && rendererTemplate.trim()) {
        var fs = require("fs");
        var mkdirp = require("mkdirp");
        var getDirName = require("path").dirname;
        var fileName = options.destinationDB + "/" +  datas.name + "/" +  schema.namespace + "/" + "schema.ts";
        mkdirp.sync(getDirName(fileName));
        fs.writeFileSync(fileName, rendererTemplate, "utf-8");
    }
}

function CreateFileForTriggersCreateForSchema(datas: Declaration, options: Options, historyStruct: Module, schema: Schema): void {
    let scriptFolder = path.resolve(__dirname, "view/");
    configure(scriptFolder, {autoescape: true, trimBlocks: true});
    var rendererTemplate = render("createTriggerFunctionTemplate.njk", {data: datas, options: options.dbOptions, hStr: historyStruct,
            schema: schema});
    if (rendererTemplate && rendererTemplate.trim()) {
        var fs = require("fs");
        var mkdirp = require("mkdirp");
        var getDirName = require("path").dirname;
        var fileName = options.destinationDB + "/" +  datas.name + "/" +  schema.namespace + "/" + "function.ts";
        mkdirp.sync(getDirName(fileName));
        fs.writeFileSync(fileName, rendererTemplate, "utf-8");
    }
    configure(scriptFolder, {autoescape: true, trimBlocks: true});
    rendererTemplate = render("createTriggerTemplate.njk", {data: datas, options: options.dbOptions,
            historyPath: options.pathToHistoryFromGeneratedModel, schema: schema});
    if (rendererTemplate && rendererTemplate.trim()) {
        fs = require("fs");
        mkdirp = require("mkdirp");
        getDirName = require("path").dirname;
        fileName = options.destinationDB + "/" +  datas.name + "/" +  schema.namespace + "/" + "trigger.ts";
        mkdirp.sync(getDirName(fileName));
        fs.writeFileSync(fileName, rendererTemplate, "utf-8");
    }
}

function CreateDBCreator(options: Options, jsonDeclaration: Declaration[]): void {
    let scriptFolder = path.resolve(__dirname, "view/");
    configure(scriptFolder, {autoescape: true, trimBlocks: true});
    var rendererTemplate = render("createDBTemplate.njk", {scriptsDestination : options.destinationDB, declaration: jsonDeclaration});
    if (rendererTemplate && rendererTemplate.trim()) {
        var fs = require("fs");
        var mkdirp = require("mkdirp");
        var getDirName = require("path").dirname;
        var fileName = options.destinationDB + "/generateDB.ts";
        mkdirp.sync(getDirName(fileName));
        fs.writeFileSync(fileName, rendererTemplate, "utf-8");
    }
}

export function CreateDbSCriptsInternal(options: Options): void {
    var fs = require("fs");
    var declaration = fs.readFileSync(options.pathToDeclaration, "utf-8");
    var jsonDeclarationObj = JSON.parse(declaration);
    let jsonDeclaration =  new Array<Declaration>();
    for (let index = 0; index < jsonDeclarationObj.length; index++) {
        let declrtion = new Declaration();
        declrtion.dbtype = jsonDeclarationObj[index].dbtype;
        declrtion.dbusername = jsonDeclarationObj[index].dbusername;
        declrtion.dbdatabase = jsonDeclarationObj[index].dbdatabase;
        declrtion.dbhost = jsonDeclarationObj[index].dbhost;
        declrtion.dbpassword = jsonDeclarationObj[index].dbpassword;
        declrtion.dbport = jsonDeclarationObj[index].dbport;
        declrtion.name = jsonDeclarationObj[index].name;
        let schms = new Array<Schema>();
        jsonDeclarationObj[index].schemas.forEach(schema => {
            let schm = new Schema();
            schm.tables = new Array<Table>();
            schm.namespace = schema.namespace;
            schema.tables.forEach(table => {
                let tble = new Table();
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
                var pathtoHistory = options.pathToHistory +  table.pathToModel + ".ts";
                stringFile += fs.readFileSync(pathtoHistory, "utf-8");
                }
                }
                var jsonStructure = parseStruct(stringFile, {}, "");
                CreateFileForTableCreate(jsonDeclaration[index], options, jsonStructure, schms[innerIndex]);
                CreateFileForTriggersCreateForSchema(jsonDeclaration[index], options, jsonStructure , schms[innerIndex]);
                stringFile = "";
            }
    }
    CreateDBCreator(options, jsonDeclaration);
}

export function CreateInitOptionsByGrunt(grunt: IGrunt ): Options {
    let opt = new Options();
    let dbOptions = new DbOptions();
    dbOptions.type = process.env.dbtype;
    dbOptions.host = process.env.dbhost;
    dbOptions.port =   process.env.dbport;
    dbOptions.username = process.env.dbusername;
    dbOptions.password = process.env.dbpassword;
    dbOptions.database = process.env.dbdatabase;
    dbOptions.reCreate = grunt.task.current.data.reCreate;
    opt.dbOptions = dbOptions;
    opt.pathToDeclaration = grunt.task.current.data.pathToDeclaration;
    opt.baseModelPath = grunt.task.current.data.baseModelPath;
    opt.destinationDB = grunt.task.current.data.destinationDB;
    opt.pathToHistory = grunt.task.current.data.pathToHistory;
    opt.pathToHistoryFromGeneratedModel = createRelativePathInternal(opt.pathToHistory, opt.destinationDB);
    opt.baseModelPathFromGeneratedModel = createRelativePathInternal(opt.baseModelPath, opt.destinationDB);
    return opt;
}

export function createRelativePathInternal (basePath: string , commonScriptPath: string ): string {
    let pathLocal: string;
    pathLocal = "../../../";
    let commonFolder = "";
    let cIndex = -1;
    let breakPoint = false;
    let pointCount = 0;
    var baseFolders = basePath.split("/");
    var commonScriptFolders = commonScriptPath.split("/");
    for ( let folderIndex = commonScriptFolders.length - 1; folderIndex >= 0; folderIndex--) {
        for ( let genfolderIndex = baseFolders.length - 1;  genfolderIndex >= 0;  genfolderIndex--) {
            if (baseFolders[genfolderIndex] === commonScriptFolders[folderIndex]) {
                pointCount = commonScriptFolders.length - 1  - folderIndex;
                commonFolder = baseFolders[genfolderIndex];
                cIndex = folderIndex;
                breakPoint = true;
                break;
            }
        }
        if (breakPoint) {
            break;
        }
    }
    for (let pInd = 0; pInd < pointCount; pInd++ ) {
        pathLocal += "../";
    }
    for ( let index = cIndex; index < baseFolders.length - 1; index++) {
        pathLocal += baseFolders[index] + "/";
    }
   return pathLocal;
}