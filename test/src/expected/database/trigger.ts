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
    let lowewrStringSchema;
    lowerStringName = 'Hero'.toLowerCase();
    lowewrStringSchema = 'bublic'.toLowerCase();
    queryproc = 'create trigger add_to_' + lowewrStringSchema + '_h_' + lowerStringName + ' after insert or delete or update on "' +
    lowewrStringSchema + '"."' + lowerStringName +
    '" for each row execute procedure ' + lowewrStringSchema +
    '.add_to_history_' + lowewrStringSchema + '_' + lowerStringName + '();';
    await db.none(queryproc);
    pgp.end();
}
