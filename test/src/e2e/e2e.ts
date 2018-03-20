"use strict";

import * as fs from "fs";
import {} from "mocha";
import {expect} from "chai";
import {CreateDbSCripts} from "../../../src/index";
import {Options, DbOptions} from "../../../src/tasks/model/options";


describe("E2E Tests", () => {

      it("Hero", (done) => {
        let dbOptions = new DbOptions();
        dbOptions.type = "dbtype1",
        dbOptions.host = "dbhost1",
        dbOptions.port = "dbport1",
        dbOptions.username = "dbusername1",
        dbOptions.password = "dbpassword1",
        dbOptions.database = "dbdatabase1",
        dbOptions.reCreate = true;
        let options = new Options();
        options.dbOptions = dbOptions;
        options.baseModelPath = "/test/src/";
        options.destinationDB = "./test/dist/dbscript";
        options.pathToDeclaration = "./test/src/declaration.json";
        CreateDbSCripts();
        var fs = require("fs");
        var res = fs.readFileSync("./test/dist/dbscript/base1/bublic/trigger.ts", "utf-8");
        var exp = fs.readFileSync("./test/src/expected/database/trigger.ts", "utf-8");
        expect(res).be.equal(exp);
        res = fs.readFileSync("./test/dist/dbscript/base1/bublic/function.ts", "utf-8");
        exp = fs.readFileSync("./test/src/expected/database/function.ts", "utf-8");
        expect(res).be.equal(exp);
        res = fs.readFileSync("./test/dist/dbscript/base1/bublic/bublicDBWrapper.ts", "utf-8");
        exp = fs.readFileSync("./test/src/expected/database/bublicDBWrapper.ts", "utf-8");
        expect(res).be.equal(exp);

        done();
      });

});
