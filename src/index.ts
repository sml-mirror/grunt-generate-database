import {CreateDbSCriptsInternal, createRelativePathInternal} from "./tasks/createDbScripts";
import {Options} from "./tasks/model/options";

export function CreateDbSCripts(options: Options): void {
    CreateDbSCriptsInternal(options);

}
export function createRelativePath(basePath: string, generationPath: string): string {
   return createRelativePathInternal(basePath, generationPath);
}


