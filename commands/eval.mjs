import {
  MessageEmbed,
  MessageAttachment,
  Discord,
  Messages,
  stringFormat,
  queues
} from '../global.mjs';

import workerpool from 'workerpool';
import { loopWhile } from 'deasync';
import { fileURLToPath } from 'url';
import pathModule from 'node:path';

const __dirname = pathModule.dirname(fileURLToPath(import.meta.url));
let exeCount = 0;
let pool = workerpool.pool(pathModule.join(__dirname, '../utils/exeWorker.js'), {
  workerType: 'process',
});
const resetPool = async () => {
  if (exeCount) return;
  await pool.terminate();
  pool = workerpool.pool(pathModule.join(__dirname, '../utils/exeWorker.js'), {
    workerType: 'process',
  });
}

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
    exeCount++;
    result = await pool.exec('run', [code, sandbox]).timeout(5000);
    exeCount--;
    await resetPool();
  } catch (e) {
    result = e;
  }
  if (result === void 0) return;
  if (result instanceof workerpool.Promise.TimeoutError || Object.prototype.toString.call(result) === "[object Error]")
    await message.channel.send(Error.prototype.toString.call(result));
  else await message.channel.send(
    (await import('util')).inspect(result),
    { split: true, code: "js" }
  );
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
