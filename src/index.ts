import {CreateDbSCriptsInternal} from "./tasks/createDbScripts";
import {Options} from "./tasks/model/options";

export function CreateDbSCripts(options: Options): void {
    CreateDbSCriptsInternal(options);
}


