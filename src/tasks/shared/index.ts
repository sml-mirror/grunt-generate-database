export const emptyString = "";
export const triggerEnabledDbTypes: string[] = ["postgres", "mssql"];

export const triggerFunctionTemplateFileName = "createTriggerFunctionTemplate.njk";
export const triggerTemplateFileName = "createTriggerTemplate.njk";
export const dbWrapperTemplateFileName = "createDBWrapper.njk";
export const utf8String = "utf-8";
export const pathToDeclaration = "./declaration.json";
export const extension = ".ts";

export enum CreateTemplateType {
    function = "function",
    trigger = "trigger",
    dbWrapper = "DBWrapper",
}

export enum DecoratorsName {
    Entity = "Entity",
    GenerateHistory = "GenerateHistory"
}
