/*Codegen*/
// tslint:disable
/* eslint-disable */

import {createConnection, ConnectionOptions} from 'typeorm';

export async function createbase1TriggerFuncsbublic() {
const pgp = require('pg-promise')({});
await pgp.end();
const connectionString = 'postgres://' + process.env.dbusername1 + ':' +
process.env.dbpassword1 + '@' + process.env.dbhost1 + ':' + process.env.dbport1 + '/' + process.env.dbdatabase1;

const db = pgp(connectionString);
let queryproc = '';
pgp.end();

}
