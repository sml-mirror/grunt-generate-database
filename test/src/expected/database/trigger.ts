/*Codegen*/
// tslint:disable
/* eslint-disable */

import { hHero } from '../../../../src/model/hero/history/hero';
import {createConnection, ConnectionOptions} from 'typeorm';

const pgPromise = require('pg-promise');

export const y_hero_bublic_trigger_string = 'create trigger add_to_y_hero_h_bublic after insert or delete or update on "bublic"."y_hero" for each row execute procedure bublic.add_to_history_bublic_y_hero();';

export async function createbase1Triggersbublic() {
    const pgp = pgPromise({});
    await pgp.end();
    const connectionString = 'postgres://' + process.env.dbusername1 + ':' +
    process.env.dbpassword1 + '@' + process.env.dbhost1 + ':' + process.env.dbport1 + '/' + process.env.dbdatabase1;
    const db = pgp(connectionString);

    await db.none(y_hero_bublic_trigger_string);
    pgp.end();
}
