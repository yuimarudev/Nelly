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
let pool = workerpool.pool(pathModule.join(__dirname, '../utils/exeWorker.mjs'), {
  workerType: 'process',
});
const resetPool = () => {
  if (--exeCount) return;
  /*const spliced = pool.workers.splice(0, pool.workers.length);
  spliced.forEach(w => {try{w.worker.kill()}catch{}});
  pool = workerpool.pool(pathModule.join(__dirname, '../utils/exeWorker.js'), {
    workerType: 'process',
  });*/
}

export default async function(message, code, client) {
  if (!(await client.application.fetch()).owner.members.has(message.author.id)) return;
  let result;
  const sandbox = { };
  for (const key in global)
  if ("global" !== key)
    sandbox[key] = global[key];
  Object.assign(sandbox, {
    message,
    process
  });
  exeCount++;
  result = await pool.exec('run', [code, sandbox, { users: [...client.users.cache.values()] }]).timeout(5000).catch(a => a);
  resetPool();
  if (result === void 0) return;
  if (result instanceof workerpool.Promise.TimeoutError || Object.prototype.toString.call(result) === "[object Error]")
    await message.channel.send(Error.prototype.toString.call(result));
  else await message.channel.send(
    (await import('util')).inspect(result),
    { split: true, code: "js" }
  );
}
