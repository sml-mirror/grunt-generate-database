import "reflect-metadata";
import {createConnection, ConnectionOptions} from "typeorm";
import {render, renderString, configure} from "nunjucks";
import {DbOptions} from "./model/options";
import {parseStruct} from "ts-structure-parser";
import * as path from "path";

function generateDatabase(grunt: any) {
    grunt.registerMultiTask("generateDatabase", function() {
        let dbOptions = new DbOptions();
        dbOptions.type = process.env.dbtype;
        dbOptions.host = process.env.dbhost;
        dbOptions.port =   process.env.dbport;
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
                    var pathtoHistory = this.data.pathToHistory +  table.pathToModel + ".ts";
                    stringFile += grunt.file.read(this.data.pathToHistory +  table.pathToModel + ".ts", options);
                  }
                  var jsonStructure = parseStruct(stringFile, {}, "");
                  CreateFileForTableCreate(jsonDeclaration[index], dbOptions, grunt, this.data, jsonStructure, schms[innerIndex]);
                  CreateFileForTriggersCreateForSchema(jsonDeclaration[index], dbOptions, grunt, this.data, jsonStructure , schms[innerIndex]);
                  stringFile = "";
              }
        }
        CreateDBCreator(grunt, this.data, jsonDeclaration);
    });
}
module.exports = generateDatabase;

function CreateFileForTableCreate(datas: any, dboptions : any, grunt: any, pathes: any, historyStruct: any, schema: any) {
    let scriptFolder = path.resolve(__dirname, "view/");
    configure(scriptFolder, {autoescape: true, trimBlocks: true});
    var rendererTemplate = render("createBaseTemplate.njk", {data: datas, options: dboptions,
        historyPath: pathes.pathToHistory, basePath: pathes.baseModelPath, schema: schema});
    if (rendererTemplate && rendererTemplate.trim()) {
        grunt.file.write(pathes.destinationDB + "/" +  datas.name + "/" +  schema.namespace + "/" + "schema.ts", rendererTemplate);
    }
}
 function CreateFileForTriggersCreateForSchema(datas: any, dboptions : any, grunt: any, pathes: any, historyStruct: any, schema: any) {
    let scriptFolder = path.resolve(__dirname, "view/");
    configure(scriptFolder, {autoescape: true, trimBlocks: true});
    var rendererTemplate = render("createTriggerFunctionTemplate.njk", {data: datas, options: dboptions, hStr: historyStruct,
        historyPath: pathes.pathToHistory, schema: schema});
    if (rendererTemplate && rendererTemplate.trim()) {
        grunt.file.write(pathes.destinationDB + "/" +  datas.name + "/" +  schema.namespace + "/" + "function.ts", rendererTemplate);
    }
    configure(scriptFolder, {autoescape: true, trimBlocks: true});
    rendererTemplate = render("createTriggerTemplate.njk", {data: datas, options: dboptions, historyPath: pathes.pathToHistory, schema: schema});
    if (rendererTemplate && rendererTemplate.trim()) {
        grunt.file.write(pathes.destinationDB + "/" +  datas.name + "/" +  schema.namespace + "/" + "trigger.ts", rendererTemplate);
    }
 }

 function CreateDBCreator(grunt: any, pathes: any, jsonDeclaration: any) {
    let scriptFolder = path.resolve(__dirname, "view/");
    configure(scriptFolder, {autoescape: true, trimBlocks: true});
    var rendererTemplate = render("createDBTemplate.njk", {scriptsDestination : pathes.destinationDB, declaration: jsonDeclaration});
    if (rendererTemplate && rendererTemplate.trim()) {
        grunt.file.write(pathes.destinationDB + "/generateDB.ts", rendererTemplate);
    }

 }



