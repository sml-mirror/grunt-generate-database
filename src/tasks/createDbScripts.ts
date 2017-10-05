import "reflect-metadata";
import {createConnection, ConnectionOptions} from "typeorm";
import {render, renderString, configure} from "nunjucks";
import {DbOptions, Options} from "./model/options";
import {parseStruct} from "ts-structure-parser";
import * as path from "path";

    function CreateFileForTableCreate(datas: any, options: Options, historyStruct: any, schema: any) {
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
    function CreateFileForTriggersCreateForSchema(datas: any, options: Options, historyStruct: any, schema: any) {
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

    function CreateDBCreator(options: Options, jsonDeclaration: any) {
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

    export function CreateDbSCriptsInternal(options: Options) {
        var fs = require("fs");
        var declaration = fs.readFileSync(options.pathToDeclaration, "utf-8");
        var jsonDeclaration = JSON.parse(declaration);
          var stringFile = "";
          var globalStringFile = "";
          for (var index = 0; index < jsonDeclaration.length; index++) {
              var schms = jsonDeclaration[index].schemas;
              stringFile = "";
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

    export function CreateInitOptionsByGrunt(grunt: any): Options {
        let opt = new Options();
        let dbOptions = new DbOptions();
        dbOptions.type = process.env.dbtype;
        dbOptions.host = process.env.dbhost;
        dbOptions.port =   process.env.dbport;
        dbOptions.username = process.env.dbusername;
        dbOptions.password = process.env.dbpassword;
        dbOptions.database = process.env.dbdatabase;
        dbOptions.reCreate = grunt.data.reCreate;
        opt.dbOptions = dbOptions;
        opt.pathToDeclaration = grunt.data.pathToDeclaration;
        opt.baseModelPath = grunt.data.baseModelPath;
        opt.destinationDB = grunt.data.destinationDB;
        opt.pathToHistory = grunt.data.pathToHistory;
        opt.pathToHistoryFromGeneratedModel = grunt.data.pathToHistoryFromGeneratedModel;
        opt.baseModelPathFromGeneratedModel = grunt.data.baseModelPathFromGeneratedModel;
        return opt;
    }