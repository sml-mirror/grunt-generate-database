export class Options {
    public dbOptions: DbOptions;
    public pathToDeclaration: string;
    public pathToHistory: string;
    public baseModelPath: string;
    public destinationDB: string;
    public hasViewModels: boolean;
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