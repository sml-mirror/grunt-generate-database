"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cr = require("./createDbScripts");
function generateDatabase(grunt) {
    grunt.registerMultiTask("generateDatabase", function () {
        let opt = cr.CreateInitOptionsByGrunt(this);
        cr.CreateDbSCriptsInternal(opt);
    });
}
module.exports = generateDatabase;
//# sourceMappingURL=generateDbScripts.js.map