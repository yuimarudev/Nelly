import { worker } from 'workerpool';
import { VM } from 'vm2';
import {
  MessageEmbed,
  MessageAttachment,
  Discord,
  Messages,
  stringFormat,
  queues
} from '../global.mjs';

const client = new Discord.Client({
  intents: Discord.Intents.NON_PRIVILEGED,
  ws: { intents: Discord.Intents.NON_PRIVILEGED }
});

const run = (code, sandbox) => {
  try {
    const ch = client.channels.cache.get(sandbox.message.channel.id);
    sandbox.message = ch.messages.add(sandbox.message);
  } catch { }
  Object.assign(sandbox, {
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
  return new VM({ sandbox }).run(code);
};
worker({ run });

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
