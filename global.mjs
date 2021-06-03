import discord from 'discord.js';

const _export = {};
_export.queues = new discord.Collection();
["MessageEmbed", "MessageAttachment"]
  .forEach(v => _export[v] = discord[v]);
_export.Discord = discord;
_export.Messages = JSON.parse(fs.readFileSync('./lang/ja_jp.json'));
_export.stringFormat = (...r) =>
r.reduce((a, c, i) => a.replace(
  new RegExp(`\\{${i}\\}`, "g"), c
), r.shift());
export const {
  MessageEmbed,
  MessageAttachment,
  Discord,
  Messages,
  stringFormat,
  queues
} = _export;
