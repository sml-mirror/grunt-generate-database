import { y_hero } from '../../../../src/model/hero/hero';
import { hy_hero } from '../../../../src/model/hero/hero';
import * as dotenv from 'dotenv';
import {createConnection, Connection, getManager, EntityManager} from 'typeorm';

export class mongoDBWrapper {

    private static connection: Connection;

    public static async initialize(dropSchema?: boolean, sync?: boolean): Promise<void> {
        await this.close();

        if (! dropSchema) {
            dropSchema = false;
        }
        if (! sync) {
            sync = false;
        }

        this.connection = await this.createTables(dropSchema, sync);
    }

    private static async createTables(dropSchema?: boolean, sync?: boolean) {
        return await createConnection({
              name: 'mongo'
            , type: 'mongodb'
            , host:  process.env.dbhost1
            , port: parseInt(process.env.dbport1, 10)
            , username:  process.env.dbusername1
            ,password: process.env.dbpassword1
            , database: process.env.dbdatabase1
            , entities: [
            y_hero
            , hy_hero
            ]
            , synchronize: sync
            , dropSchema: dropSchema
      });
    }
    public static getEntityManager (): EntityManager {
        return getManager('mongo');
    }

    public static async close(): Promise<void> {
        if (this.connection) {
            await this.connection.close();
            this.connection = null;
        }
    }
}
