import {Table} from "./table";

export class Schema {
    public namespace: string;
    public recreate: boolean;
    public tables: Table[];
}