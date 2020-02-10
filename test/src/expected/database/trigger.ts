/*Codegen*/
// tslint:disable
/* eslint-disable */

import { hHero } from '../../../../src/model/hero/hero';
import {createConnection, ConnectionOptions} from 'typeorm';


export async function createbase1Triggersbublic() {
    const pgp = require('pg-promise')({});
    await pgp.end();
    const connectionString = 'postgres://' + process.env.dbusername1 + ':' +
    process.env.dbpassword1 + '@' + process.env.dbhost1 + ':' + process.env.dbport1 + '/' + process.env.dbdatabase1;
    const db = pgp(connectionString);
    let queryproc;
    let lowerStringName;
    let lowerStringSchema;
    lowerStringName = 'y_hero'.toLowerCase();
    lowerStringSchema = 'bublic'.toLowerCase();
    queryproc = 'create trigger add_to_' + lowerStringSchema + '_h_' + lowerStringName + ' after insert or delete or update on "' +
    lowerStringSchema + '"."' + lowerStringName +
    '" for each row execute procedure ' + lowerStringSchema +
    '.add_to_history_' + lowerStringSchema + '_' + lowerStringName + '();';
    await db.none(queryproc);
    pgp.end();
}
