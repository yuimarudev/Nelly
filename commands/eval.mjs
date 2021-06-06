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
import execute from '../util/execute.mjs';

const __dirname = pathModule.dirname(fileURLToPath(import.meta.url));

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
      process,
      require
    });
    result = await execute(code, sandbox);
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

function require(_path) {
  const path = pathModule.resolve(__dirname, _path);
  let mod, done, exception;
  import(path).then(
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
