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
import { fileURLToPath } from 'url';
import pathModule from 'node:path';

const __dirname = pathModule.dirname(fileURLToPath(import.meta.url));

export default async function(message, code, client) {
  if (!(await client.application.fetch()).owner.members.has(message.author.id)) return;
  let result;
  try {
    const sandbox = { };
    for (const key in global)
    if (!["setTimeout", "global", "setInterval"].includes(key))
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
      process,
      // require,  どうやらVMとdeasyncは、相性が悪いようで。
      import: (...a) => import(...a),
      setTimeout(...a) {
        const id = setTimeout(...a);
        globalThis.timeouts.push(id);
        return id;
      },
      setInterval(...a) {
        const id = setInterval(...a);
        globalThis.intervals.push(id);
        return id;
      }
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
  return Promise.race([
    promise,
    new Promise(
      (_, e) => setTimeout(() => {
        e(new Error("timeout"));
      }, 5000)
    )
  ]);
}

function require(_path) {
  let mod, done, exception;
  import(_path).then(
    value => {
      mod = value;
      done = true;
    },
    ex => {
      exception = ex;
      done = true;
    }
  );
  loopWhile(() => !done);
  if (exception) throw exception;
  if (mod !== void 0 && mod !== null) {
    return mod.default || mod;
  }
};
require.prototype.toString(() => "function require() { }");
