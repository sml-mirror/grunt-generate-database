import "reflect-metadata";
import {createConnection, ConnectionOptions} from "typeorm";
import {render, renderString, configure} from "nunjucks";
import {DbOptions, Options} from "./model/options";
import {Schema} from "./model/schema";
import {Table} from "./model/table";
import {Declaration} from "./model/declaration";
import {parseStruct, Module} from "ts-file-parser";
import * as path from "path";

function CreateFileForTriggersCreateForSchema(declaration: Declaration, historyStruct: Module, schema: Schema): void {
    let scriptFolder = path.resolve(__dirname, "view/");
    configure(scriptFolder, {autoescape: true, trimBlocks: true});
    var rendererTemplate = render("createTriggerFunctionTemplate.njk", {data: declaration, hStr: historyStruct,
            schema: schema});
    if (rendererTemplate && rendererTemplate.trim()) {
        var fs = require("fs");
        var mkdirp = require("mkdirp");
        var getDirName = require("path").dirname;
        var fileName = declaration.pathToDBWrappers + "/" +  declaration.name + "/" +  schema.namespace + "/" + "function.ts";
        mkdirp.sync(getDirName(fileName));
        fs.writeFileSync(fileName, rendererTemplate, "utf-8");
    }
    configure(scriptFolder, {autoescape: true, trimBlocks: true});
    rendererTemplate = render("createTriggerTemplate.njk", {data: declaration,
            historyPath: createRelativePathInternal(declaration.pathToHistory, declaration.pathToDBWrappers), schema: schema});
    if (rendererTemplate && rendererTemplate.trim()) {
        fs = require("fs");
        mkdirp = require("mkdirp");
        getDirName = require("path").dirname;
        fileName = declaration.pathToDBWrappers + "/" +  declaration.name + "/" +  schema.namespace + "/" + "trigger.ts";
        mkdirp.sync(getDirName(fileName));
        fs.writeFileSync(fileName, rendererTemplate, "utf-8");
    }
}

function CreateDBCreator(declarations: Declaration[]): void {
    declarations.forEach( declaration => {
        let scriptFolder = path.resolve(__dirname, "view/");
        configure(scriptFolder, {autoescape: true, trimBlocks: true});
        for (let i = 0 ; i < declaration.schemas.length; i++) {
            const basePathToCommonModel = declaration.pathToCommonModels;
            const pathToHistory = declaration.pathToHistory;
            declaration.pathToCommonModels = createRelativePathInternal(declaration.pathToCommonModels, declaration.pathToDBWrappers);
            declaration.pathToHistory = createRelativePathInternal(declaration.pathToHistory, declaration.pathToDBWrappers);
            var rendererTemplate = render("createDBWrapper.njk", {declaration: declaration, index: i});
            if (rendererTemplate && rendererTemplate.trim()) {
                var fs = require("fs");
                var mkdirp = require("mkdirp");
                var getDirName = require("path").dirname;
                var fileName = declaration.pathToDBWrappers  + "/" +  declaration.name + "/" + declaration.schemas[i].namespace +
                `/${declaration.schemas[i].namespace}DBWrapper.ts`;
                mkdirp.sync(getDirName(fileName));
                fs.writeFileSync(fileName, rendererTemplate, "utf-8");
            }
            declaration.pathToCommonModels = basePathToCommonModel;
            declaration.pathToHistory = pathToHistory;
        }
    });
}

export function CreateDbSCriptsInternal(opt?: Options): void {
    var fs = require("fs");
    const pathToDeclaration = "./declaration.json";
    const jsonDeclarations  = fs.readFileSync(pathToDeclaration, "utf-8");
    var declarations  = <Declaration[]>JSON.parse(jsonDeclarations);
    let stringFile = "";
    for (let index = 0; index < declarations.length; index++) {
        let schms = declarations[index].schemas;
        for (var innerIndex = 0; innerIndex < schms.length; innerIndex++) {
            for (var tableIndex = 0; tableIndex < schms[innerIndex].tables.length; tableIndex++) {
                var table = schms[innerIndex].tables[tableIndex];
                var pathtobaseModel = declarations[index].pathToCommonModels + table.pathToModel + ".ts";
                stringFile += fs.readFileSync(pathtobaseModel, "utf-8");
                if (declarations[index].pathToHistory && table.isHistoried) {
                    var pathtoHistory = declarations[index].pathToHistory +  table.pathToModel + ".ts";
                    stringFile += fs.readFileSync(pathtoHistory, "utf-8");
                }
            }
            var jsonStructure;
            if ((opt && opt.hasViewModels) || declarations[index].hasViewModels) {
                var correctStringFile  = ViewModelTypeCorrecting(stringFile);
                jsonStructure = parseStruct(correctStringFile, {}, "");
            } else {
                jsonStructure = parseStruct(stringFile, {}, "");
            }
            CreateFileForTriggersCreateForSchema(declarations[index], jsonStructure , schms[innerIndex]);
            stringFile = "";
        }
    }
    CreateDBCreator(declarations);

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
    return opt;
}

export function createRelativePathInternal (basePath: string , commonScriptPath: string ): string {
    if (basePath === undefined) {
        return null;
    }
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

function ViewModelTypeCorrecting(input: string): string {
    let firstViewModelTypeInArray = input.split("@ViewModelType");
    let result = firstViewModelTypeInArray.map( str => {
        let tmpStr =  str.trim();
        let viewModelTypeDecoratorRegExp = /\(\s?{\s*?["']type["']\s?:\s?\w+/;
        let matches = viewModelTypeDecoratorRegExp.exec(tmpStr);
        if (matches) {
            let need = matches[0];
            let matchRegExp = /[A-Z]\w+/;
            let innerMatches = matchRegExp.exec(need);
            tmpStr = tmpStr.replace(innerMatches[0], `"${innerMatches[0]}"`);
        }
        let viewModelTypeDecoratorForTransformer = /["']function["']\s?:\s?\w+(\.)?(\w+)?/;
        let secMatches = viewModelTypeDecoratorForTransformer.exec(tmpStr);
        if (secMatches) {
            let need = secMatches[0];
            let matchRegExp = /:\s?\w+(\.)?(\w+)?/;
            let innerMatches = matchRegExp.exec(need);
            let variant = `: "${innerMatches[0].substring(1).trim()}"`;
            tmpStr =  tmpStr.replace(innerMatches[0], variant);
        }
        return tmpStr;
    }).join("@ViewModelType");
    return result;
}