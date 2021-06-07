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
client.login(process.env.token);

const run = (code, sandbox, clientData) => new Promise((s, e) => {
  client.on("ready", () => {
    try {
      const ch = client.channels.cache.get(sandbox.message.channel.id);
      sandbox.message = ch.messages.add(sandbox.message);
    } catch { }
    for (const u of clientData.users) client.users.cache.add(u);
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
    try {
      s(new VM({ sandbox }).run(code));
    } catch(ex) {
      e(ex);
    }
  });
});
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
