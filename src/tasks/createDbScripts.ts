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
    rendererTemplate = render("createTriggerTemplate.njk", {data: declaration, schema: schema});
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
        let jsonStructure: Module = null;
        schms.forEach(schema => {
            schema.tables.forEach(table => {
                let fileContent: string = fs.readFileSync(table.pathToModel + ".ts", "utf-8");
                jsonStructure = parseStruct(fileContent, {}, "");
                jsonStructure.classes.forEach(_class => {
                    _class.decorators.forEach(dec => {
                        if (dec.name === "GenerateHistory" && _class.name.toLowerCase() === table.name.toLowerCase()) {
                            table.historyPath = dec.arguments[0].valueOf()["historyPath"] + "/" +_class.name.toLowerCase();
                        }
                    });
                });
            });
        });

        for (var innerIndex = 0; innerIndex < schms.length; innerIndex++) {
            for (var tableIndex = 0; tableIndex < schms[innerIndex].tables.length; tableIndex++) {
                var table = schms[innerIndex].tables[tableIndex];
                var pathtobaseModel = table.pathToModel + ".ts";
                stringFile += fs.readFileSync(pathtobaseModel, "utf-8");
                if (table.historyPath) {
                    var pathtoHistory = table.historyPath + ".ts";
                    stringFile += fs.readFileSync(pathtoHistory, "utf-8");
                }
            }
            schms[innerIndex].tables.forEach(table => {
                let tmpPathtoDBWrappers = declarations[index].pathToDBWrappers + "/" + declarations[index].name + "/" + schms[innerIndex].namespace;
                if(table.historyPath) {
                    table.historyPath = require("path").relative(tmpPathtoDBWrappers, table.historyPath).split("\\").join("/");
                }
                table.pathToModel = require("path").relative(tmpPathtoDBWrappers, table.pathToModel).split("\\").join("/");
            });
            let json = parseStruct(stringFile, {}, "");
            CreateFileForTriggersCreateForSchema (declarations[index], json , schms[innerIndex]);
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
    return opt;
}
