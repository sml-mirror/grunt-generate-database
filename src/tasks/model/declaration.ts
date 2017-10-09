import {Schema} from "./schema";

export class Declaration {

public name: string;
public dbtype: string;
public dbhost: string;
public dbport: number;
public dbusername: string;
public dbpassword: string;
public dbdatabase: string;
public schemas: Schema[];
}