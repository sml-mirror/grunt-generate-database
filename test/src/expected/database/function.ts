import {createConnection, ConnectionOptions} from 'typeorm';


export async function createbase1TriggerFuncsbublic() {
    const pgp = require("pg-promise")({});
              await pgp.end();
var connectionString = "postgres://" + process.env.dbusername1 + ":" +
process.env.dbpassword1 + "@" + process.env.dbhost1 + ":" + process.env.dbport1 + "/" + process.env.dbdatabase1;

const db = pgp(connectionString);
var queryproc = "";
pgp.end();

}