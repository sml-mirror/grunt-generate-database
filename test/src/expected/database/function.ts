/*Codegen*/
// tslint:disable
/* eslint-disable */

import {createConnection, ConnectionOptions} from 'typeorm';

export const y_hero_bublic_function_trigger_string= `CREATE OR REPLACE FUNCTION bublic.add_to_history_bublic_y_hero() RETURNS TRIGGER AS $$ begin
IF (TG_OP='INSERT') THEN INSERT INTO \"bublic\".\"h_y_hero\"( __id, __operation, __changedate
,id
,"name"
,detailId
,simpleArray
)values (default,TG_OP,NOW()
,NEW.id,NEW.\"name\",NEW.detailId,NEW.simpleArray); return new;
ELSIF (TG_OP='UPDATE') THEN INSERT INTO \"bublic\".\"h_y_hero\" ( __id, __operation, __changedate
,id
,"name"
,detailId
,simpleArray
)values (default,TG_OP,NOW()
,NEW.id,NEW.\"name\",NEW.detailId,NEW.simpleArray); return new;
ELSIF (TG_OP='DELETE') THEN INSERT INTO \"bublic\".\"h_y_hero\" ( __id, __operation, __changedate
,id
,"name"
,detailId
,simpleArray
)values (default,TG_OP,NOW()
,OLD.id,OLD.\"name\",OLD.detailId,OLD.simpleArray); return old; end if; return null;
END;$$ LANGUAGE plpgsql;`

export async function createbase1TriggerFuncsbublic() {
const pgp = require('pg-promise')({});
await pgp.end();
const connectionString = 'postgres://' + process.env.dbusername1 + ':' +
process.env.dbpassword1 + '@' + process.env.dbhost1 + ':' + process.env.dbport1 + '/' + process.env.dbdatabase1;
const db = pgp(connectionString);

await db.none(y_hero_bublic_function_trigger_string);
pgp.end();

}
