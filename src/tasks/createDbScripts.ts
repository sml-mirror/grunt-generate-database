import "reflect-metadata";
import { configure } from "nunjucks";
import * as dotenv from "dotenv";
import * as path from "path";
import {DbOptions, Options} from "./model/options";
import {Schema} from "./model/schema";
import {Declaration} from "./model/declaration";
import {parseStruct, Module} from "ts-file-parser";
import { postgresKeywords } from "../tasks/keywords";
import {
    utf8String,
    extension,
    CreateTemplateType,
    triggerFunctionTemplateFileName,
    triggerTemplateFileName,
    dbWrapperTemplateFileName,
    emptyString,
    postgresString,
    pathToDeclaration,
    DecoratorsName
} from "./shared";

const fs = require("fs");
const mkdirp = require("mkdirp");

function createFile(rendererTemplate: string, pathToWrapper: string, declarationName: string, namespace: string, filename: string) {
    if (rendererTemplate && rendererTemplate.trim()) {
        const fileName = `${pathToWrapper}/${declarationName}/${namespace}/${filename}`;
        mkdirp.sync(path.dirname(fileName));
        fs.writeFileSync(fileName, rendererTemplate, utf8String);
    }
}

function configureEnvironment(scriptFolder: string) {
    const env = configure(scriptFolder, {autoescape: true, trimBlocks: true});
    return env;
}

function createFileForTriggersCreateForSchema(declaration: Declaration, hStr: Module, schema: Schema): void {
    let scriptFolder = path.resolve(__dirname, `view/${declaration.db}/`);
    const environment = configureEnvironment(scriptFolder);

    const functionRendererTemplate = environment.render(triggerFunctionTemplateFileName, {data: declaration, hStr, schema, postgresKeywords});
    createFile(
        functionRendererTemplate,
        declaration.pathToDBWrappers,
        declaration.name, schema.namespace,
        `${CreateTemplateType.function}${extension}`
    );

    const triggerRendererTemplate = environment.render(triggerTemplateFileName, { data: declaration, schema, postgresKeywords});
    createFile(
        triggerRendererTemplate,
        declaration.pathToDBWrappers,
        declaration.name, schema.namespace,
        `${CreateTemplateType.trigger}${extension}`
    );
}

function createDBCreator(declarations: Declaration[]): void {
    declarations.forEach( declaration => {
        let scriptFolder = path.resolve(__dirname, `view/${declaration.db}/`);
        const environment = configureEnvironment(scriptFolder);
        for (let i = 0 ; i < declaration.schemas.length; i++) {
            const rendererTemplate = environment
                .render(dbWrapperTemplateFileName, {declaration: declaration, index: i, postgresKeywords: postgresKeywords});
            createFile(
                rendererTemplate,
                declaration.pathToDBWrappers,
                declaration.name,
                declaration.schemas[i].namespace,
                `${declaration.schemas[i].namespace}${CreateTemplateType.dbWrapper}${extension}`
            );
        }
    });
}

export function CreateDbSCriptsInternal(opt?: Options): void {
    const jsonDeclarations  = fs.readFileSync(pathToDeclaration, utf8String);
    const declarations  = <Declaration[]>JSON.parse(jsonDeclarations);
    let stringFile = emptyString;

    for (let index = 0; index < declarations.length; index++) {
        let schms = declarations[index].schemas;
        let jsonStructure: Module = null;
        schms.forEach(schema => {
            schema.tables.forEach(table => {
                let fileContent: string = fs.readFileSync(`${table.pathToModel}${extension}`, utf8String);
                jsonStructure = parseStruct(fileContent, {}, emptyString);
                jsonStructure.classes.forEach(_class => {
                    table.modelName = _class.name;
                    _class.decorators.forEach(dec => {
                        if (dec.name === DecoratorsName.Entity) {
                            table.name = dec.arguments.length > 0
                                ? dec.arguments[0] as string
                                : _class.name.toLowerCase();
                        }
                        if (dec.name === DecoratorsName.GenerateHistory && _class.name.toLowerCase() === table.modelName.toLowerCase()) {
                            table.historyPath = dec.arguments[0].valueOf()["historyPath"] + "/"
                                                + _class.name.charAt(0).toLowerCase() + _class.name.slice(1);
                        }
                    });
                });
            });
        });

        for (let innerIndex = 0; innerIndex < schms.length; innerIndex++) {
            for (let tableIndex = 0; tableIndex < schms[innerIndex].tables.length; tableIndex++) {
                const table = schms[innerIndex].tables[tableIndex];
                const pathtobaseModel = `${table.pathToModel}${extension}`;
                stringFile += fs.readFileSync(pathtobaseModel, utf8String);
                if (table.historyPath) {
                    const pathtoHistory = `${table.historyPath}${extension}`;
                    stringFile += fs.readFileSync(pathtoHistory, utf8String);
                }
            }
            schms[innerIndex].tables.forEach(table => {
                let tmpPathtoDBWrappers = declarations[index].pathToDBWrappers + "/" + declarations[index].name + "/" + schms[innerIndex].namespace;
                if (table.historyPath) {
                    table.historyPath = path.relative(tmpPathtoDBWrappers, table.historyPath).split("\\").join("/");
                }
                table.pathToModel = path.relative(tmpPathtoDBWrappers, table.pathToModel).split("\\").join("/");
            });
            let json = parseStruct(stringFile, {}, emptyString);
            if (declarations[index].db === postgresString) {
                createFileForTriggersCreateForSchema (declarations[index], json , schms[innerIndex]);
            }
            stringFile = emptyString;
        }
    }
    createDBCreator(declarations);
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
