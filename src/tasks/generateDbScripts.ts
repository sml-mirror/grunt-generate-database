import * as cr from "./createDbScripts";

function generateDatabase(grunt: any) {
    grunt.registerMultiTask("generateDatabase", function() {
       let opt = cr.CreateInitOptionsByGrunt(this);
       cr.CreateDbSCriptsInternal(opt);
    });
}
module.exports = generateDatabase;