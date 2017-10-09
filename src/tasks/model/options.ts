export class Options {
    public dbOptions: DbOptions;
    public pathToDeclaration: string;
    public pathToHistory: string;
    public pathToHistoryFromGeneratedModel: string;
    public baseModelPath: string;
    public baseModelPathFromGeneratedModel: string;
    public destinationDB: string;
}
export class DbOptions {
    public type: string;
    public host: string;
    public port: string;
    public username: string;
    public password: string;
    public database: string;
    public reCreate: boolean;
}