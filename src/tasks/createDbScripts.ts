import "reflect-metadata";
import { configure, Environment } from "nunjucks";
import * as path from "path";
import {DbOptions, Options} from "./model/options";
import {Schema} from "./model/schema";
import {Declaration} from "./model/declaration";
import {parseStruct, Module} from "ts-file-parser";
import { mssqlKeywords, postgresKeywords } from "./keywords";
import {
    utf8String,
    extension,
    CreateTemplateType,
    triggerFunctionTemplateFileName,
    triggerTemplateFileName,
    dbWrapperTemplateFileName,
    emptyString,
    triggerEnabledDbTypes,
    pathToDeclaration,
    DecoratorsName,
    triggerMssqlFileName
} from "./shared";

const fs = require("fs");
const mkdirp = require("mkdirp");

const dbTypeKeywords: Record<string, string[]> = {
    mssql: mssqlKeywords,
    postgres: postgresKeywords,
};

const replaceLinuxSlashToCommonFromPath = (path: string) => {
    return path.split("\\").join("/")
};

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

const fileCreator = (
    environment: Environment,
    schema: Schema,
    data: Declaration,
    keywords: string[],
    pathToWrappers: string,
    name: string,
    templateFile: string,
    templateType: CreateTemplateType,
    hStr?: Module
) => {
    const functionRendererTemplate = environment.render(templateFile, {
        hStr,
        schema,
        data,
        keywords,
    });

    const futureFunctionFileName =  `${templateType}${extension}`;
    createFile(functionRendererTemplate, pathToWrappers, name, schema.namespace, futureFunctionFileName);

};

function createFileForTriggersCreateForSchema(declaration: Declaration, hStr: Module, schema: Schema): void {
    let scriptFolder = path.resolve(__dirname, `view/${declaration.db}/`);
    const environment = configureEnvironment(scriptFolder);
    const {pathToDBWrappers, name, db} = declaration;
    const keywords = dbTypeKeywords[db];
    switch (db) {
        case "mssql":
            fileCreator(
                environment,
                schema,
                declaration,
                keywords,
                pathToDBWrappers,
                name,
                triggerMssqlFileName,
                CreateTemplateType.function,
                hStr
            );
            break;
        case "postgres":
            fileCreator(
                environment,
                schema,
                declaration,
                keywords,
                pathToDBWrappers,
                name,
                triggerFunctionTemplateFileName,
                CreateTemplateType.function,
                hStr
            );

            fileCreator(
                environment,
                schema,
                declaration,
                keywords,
                pathToDBWrappers,
                name,
                triggerTemplateFileName,
                CreateTemplateType.trigger,
                hStr
            );
            break;
        default:
            console.warn(`${db} has no supported functions to create triggers(available 'mssql', 'postgres')`);
            break;
    }
}

function createDBCreator(declarations: Declaration[]): void {
    declarations.forEach( declaration => {
        let scriptFolder = path.resolve(__dirname, `view/${declaration.db}/`);
        const environment = configureEnvironment(scriptFolder);
        for (let index = 0 ; index < declaration.schemas.length; index++) {
            const keywords = (dbTypeKeywords[declaration.db] || []);
            const rendererTemplate = environment.render(dbWrapperTemplateFileName, {declaration, index, keywords });
            createFile(
                rendererTemplate,
                declaration.pathToDBWrappers,
                declaration.name,
                declaration.schemas[index].namespace,
                `${declaration.schemas[index].namespace}${CreateTemplateType.dbWrapper}${extension}`
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
                        const isClassNameIsEqualTableModelName = _class.name.toLowerCase() === table.modelName.toLowerCase();
                        const needToAddHistoryPathToTable = dec.name === DecoratorsName.GenerateHistory && isClassNameIsEqualTableModelName;
                        if (!needToAddHistoryPathToTable) {
                            return;
                        }
                        const historyPath = dec.arguments[0].valueOf()["historyPath"];
                        const classFirstChar = _class.name.charAt(0).toLowerCase();
                        table.historyPath = `${historyPath}/${classFirstChar}${_class.name.slice(1)}`;
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
                const {pathToDBWrappers, name} = declarations[index];
                const baseNamespace = schms[innerIndex].namespace;
                let tmpPathtoDBWrappers = `${pathToDBWrappers}/${name}/${baseNamespace}`;
                if (table.historyPath) {
                    const historyPath = path.relative(tmpPathtoDBWrappers, table.historyPath);
                    table.historyPath = replaceLinuxSlashToCommonFromPath(historyPath);
                }
                const pathToModel = path.relative(tmpPathtoDBWrappers, table.pathToModel);
                table.pathToModel = replaceLinuxSlashToCommonFromPath(pathToModel)
            });
            const json = parseStruct(stringFile, {}, emptyString);
            const isTriggerCreateEnable = triggerEnabledDbTypes.find(type => type === declarations[index].db);
            if (isTriggerCreateEnable) {
                createFileForTriggersCreateForSchema(declarations[index], json , schms[innerIndex]);
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
