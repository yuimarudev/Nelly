import Discord from './node_modules/discord.js/src/index.js';
import fs from 'fs';

const queues = new Discord.Collection();
const { MessageEmbed, MessageAttachment } = Discord;
const client = new Discord.Client({
  intents: Discord.Intents.NON_PRIVILEGED,
  ws: {
    intents: Discord.Intents.NON_PRIVILEGED,
    properties: {
        $browser: 'God of Nelly'
    }
  }
});
client.login(process.env.token);
const Messages = JSON.parse(fs.readFileSync('./lang/ja_jp.json'));
const stringFormat = (...r) =>
r.reduce((a, c, i) => a.replace(
  new RegExp(`\\{${i}\\}`, "g"), c
), r.shift());
export {
  MessageEmbed,
  MessageAttachment,
  Messages,
  stringFormat,
  queues,
  Discord,
  client
};
