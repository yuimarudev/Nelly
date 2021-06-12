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

export default async function(message, code, client) {
  if (!(await client.application.fetch()).owner.members.has(message.author.id) && message.author.id !== "691160715431772160") return;
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
  result = await pool.exec('run', [code, sandbox]).timeout(12000).catch(a => a);
  if (result === void 0) return;
  if (result instanceof workerpool.Promise.TimeoutError || Object.prototype.toString.call(result) === "[object Error]")
    await message.channel.send(Error.prototype.toString.call(result));
  else await message.channel.send(
    (await import('util')).inspect(result),
    { split: true, code: "js" }
  );
}
