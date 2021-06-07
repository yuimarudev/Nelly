const worker = require('workerpool').worker;
const { VM } = require('vm2');
const run = (code, sandbox) => new VM({ sandbox }).run(code);
worker({ run });
