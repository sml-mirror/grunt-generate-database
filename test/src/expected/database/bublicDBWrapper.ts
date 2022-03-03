/*Codegen*/
// tslint:disable
/* eslint-disable */
import {createConnection, Connection, getManager, EntityManager} from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

import { Hero } from '../../../../src/model/hero/hero';
import { hHero } from '../../../../src/model/hero/history/hero';
import { createbase1TriggerFuncsbublic } from './function';
import { createbase1Triggersbublic } from './trigger';

export class bublicDBWrapper {

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
        if (dropSchema) {
            await createbase1TriggerFuncsbublic();
            await createbase1Triggersbublic();
        }
    }

    private static async createTables(dropSchema?: boolean, sync?: boolean, extra?: Partial<PostgresConnectionOptions>) {
        const baseOptions: PostgresConnectionOptions = {
            name: 'bublic',
            type: 'postgres',
            replication: {
                master: {
                    host:  process.env.dbhost1,
                    port: parseInt(process.env.dbport1, 10),
                    username:  process.env.dbusername1,
                    password: process.env.dbpassword1,
                    database: process.env.dbdatabase1
                },
                slaves: []
            },
            entities: [Hero, hHero,],
            schema: 'bublic',
            synchronize: sync,
            dropSchema: dropSchema
        }

        const optionsToConnect = {...(extra || {}), ...baseOptions};
        return await createConnection(optionsToConnect);
    }
    public static getEntityManager (): EntityManager {
        return getManager('bublic');
    }

    public static async close(): Promise<void> {
        if (this.connection) {
            await this.connection.close();
            this.connection = null;
        }
    }
}
