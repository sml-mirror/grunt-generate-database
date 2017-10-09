import * as cr from "./createDbScripts";

function generateDatabase(grunt: IGrunt) {
    grunt.registerMultiTask("generateDatabase", function() {
       let opt = cr.CreateInitOptionsByGrunt(grunt);
       cr.CreateDbSCriptsInternal(opt);
    });
}
module.exports = generateDatabase;