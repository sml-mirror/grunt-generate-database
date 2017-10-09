import { createbase1bublic } from "./base1/bublic/schema" ;
import { createbase1TriggerFuncsbublic } from "./base1/bublic/function" ;
import { createbase1Triggersbublic } from "./base1/bublic/trigger" ;

f();

async function f() {
await createbase1bublic();
await createbase1TriggerFuncsbublic();
await createbase1Triggersbublic();
}
