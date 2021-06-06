import {
  MessageEmbed,
  MessageAttachment,
  Discord,
  Messages,
  stringFormat,
  queues
} from '../global.mjs';

import { VM } from 'vm2';
import { loopWhile } from 'deasync';

export default async function(message, code, client) {
  if (!(await client.application.fetch()).owner.members.has(message.author.id)) return;
  let result;
  try {
    const sandbox = { };
    for (const key in global)
    if ("global" !== key)
      sandbox[key] = global[key];
    Object.assign(sandbox, {
      message,
      client,
      MessageEmbed,
      MessageAttachment,
      Discord,
      Messages,
      stringFormat,
      queues,
      process
    });
    const vm = new VM({
      sandbox,
      timeout: 1000
    });
    result = await withTimeout(vm.run(code));
  } catch (e) {
    result = e;
  }
  if (result === void 0) return;
  if (Object.prototype.toString.call(result) === "[object Error]")
    await message.channel.send(Error.prototype.toString.call(result));
  else await message.channel.send(
    (await import('util')).inspect(result),
    { split: true, code: "js" }
  );
}

function withTimeout(promise) {
  return new VM({
    sandbox: { promise, loopWhile },
    timeout: 5000
  }).run(`
    (() => {
      let v, d, r;
      promise.then(
        a => { v = a; d = true; }, 
        e => { v = e; r = d = true; }
      );
      loopWhile(_=>!d);
      const [value, rejected] = [v, r];
      if (rejected) throw value; return value;
    })();
  `);
}

