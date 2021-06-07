import Discord from 'discord.js';
import fs from 'fs';
export Discord;

const _export = {};
_export.queues = new Discord.Collection();
["MessageEmbed", "MessageAttachment"]
  .forEach(v => _export[v] = Discord[v]);
_export.client = new Discord.Client({
  intents: Discord.Intents.NON_PRIVILEGED,
  ws: {
    intents: Discord.Intents.NON_PRIVILEGED,
    properties: {
        $browser: 'God of Nelly'
    }
  }
});
_export.Discord = Discord;
_export.Messages = JSON.parse(fs.readFileSync('./lang/ja_jp.json'));
_export.stringFormat = (...r) =>
r.reduce((a, c, i) => a.replace(
  new RegExp(`\\{${i}\\}`, "g"), c
), r.shift());
export const {
  MessageEmbed,
  MessageAttachment,
  Messages,
  stringFormat,
  queues
} = _export;
