import { worker } from 'workerpool';
import { VM } from 'vm2';
const run = (code, sandbox) => new VM({ sandbox }).run(code);
worker({ run });
