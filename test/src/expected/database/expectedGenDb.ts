import { createbase1bublic } from './base1/bublic/schema' ;
import { createbase1TriggerFuncsbublic } from './base1/bublic/function' ;
import { createbase1Triggersbublic } from './base1/bublic/trigger' ;
import * as dotenv from 'dotenv';

f();

async function f() {

if (process.argv.length > 2) {
    dotenv.load({ path: process.argv[2] });
} else {
    dotenv.load({ path: '.env' });
}
await createbase1bublic();
await createbase1TriggerFuncsbublic();
await createbase1Triggersbublic();
}
