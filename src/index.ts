import {CreateDbSCriptsInternal, createRelativePathInternal} from "./tasks/createDbScripts";
import {Options} from "./tasks/model/options";

export function CreateDbSCripts(): void {
    CreateDbSCriptsInternal();

}
export function createRelativePath(basePath: string, generationPath: string): string {
   return createRelativePathInternal(basePath, generationPath);
}


