import { Hero } from "../../../../../test/src/model/hero/hero";
import {createConnection, ConnectionOptions} from "typeorm";

export async function createbase1bublic() {
    const pgp = require("pg-promise")({});
              await pgp.end();
    var connectionString = "postgres://" + process.env.dbusername1 + ":" +
    process.env.dbpassword1 + "@" + process.env.dbhost1 + ":" + process.env.dbport1 + "/postgres";
    const db = pgp(connectionString);
    var res = await db.oneOrNone("SELECT 1 FROM pg_database WHERE datname = " + "'" + process.env.dbdatabase1 + "'");
    if (res === null) {
          var str = "CREATE DATABASE " + process.env.dbdatabase1 ;
          await db.query(str);
    }
    await pgp.end();
    return await createConnection({
    type: "postgres",
    host:  process.env.dbhost1,
    port: process.env.dbport1,
    username:  process.env.dbusername1,
    password: process.env.dbpassword1,
    database: process.env.dbdatabase1,
    entities: [
      Hero
],
        schema: "bublic",
        synchronize: true,
        dropSchema: true
         })
         .catch(error => console.log(error))
         .then(connection => connection.close());
}