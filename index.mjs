import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { on } from 'events';
import leven from 'levenshtein';
import SpaceSplit from './spliter.mjs';
import commandArgs from './commands.js';
import {
  MessageEmbed,
  MessageAttachment,
  Discord,
  Messages,
  stringFormat,
  queues,
  client
} from './global.mjs';

dotenv.config();

const commands = {};

const prefix = process.env.prefix;

process.stdin.on('data', chunk => {
  chunk = String(chunk);
  if (typeof chunk.match === "function" && chunk.match('sine')) {
    console.log("グハッ！");
    process.exit(-1);
  };
});

client.on('ready', async () => {
  let list = fs.readdirSync(new URL("./commands", import.meta.url))
    .filter(x => x.endsWith('.mjs') || x.endsWith('.js'))
  for (let command of list) {
    const run = await import(new URL(`./commands/${command}`, import.meta.url));
    commands[command.replace(/.(m)?js$/, '')] = run.default;
    console.log('\'' + command + '\'' + "を読み込んだよ！");
  };
  console.log('ready');
  setInterval(() => {
    client.user.setActivity(client.guilds.cache.size + 'サーバー', { type: 'COMPETING' });
    setTimeout(() => {
      client.user.setActivity('ready At: ' + client.readyAt);
    }, 3000);
  }, 6000);
});

client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix) && !message.mentions.users.has(client.user.id))
    return;
  message.content = message.content.replace(new RegExp(`^<@!?${client.user.id}>\s?`), prefix);
  const args = SpaceSplit(message.content.slice(prefix.length));
  let command = args.shift();
  const commandDict = commandArgs.commands;
  const aliasDict = commandArgs.aliases;
  const curs = (command in commandDict) ? command : (aliasDict[command] in commandDict ? aliasDict[command] : false);
  if (curs) {
    let cursor = commandArgs.commands[curs];
    if (cursor.variadic || cursor.args.some(x => x.length === args.length)) {
      let result;
      try {
        result = await commands[curs]?.(message, args, client);
      } catch (ex) {
        result = stringFormat(Messages.AccidentMessage, '```toml\n' + ex.message + '\n```');
      };
      if (result) return message.channel.send(result);
    } else {
      return message.reply(stringFormat(Messages.InvalidArgMessage, prefix, curs));
    };
  } else {
    let dym = Object.keys(commandDict).concat(Object.keys(aliasDict).filter(alias => 2 < alias.length))
      .reduce((acc, cur) => {
        let { distance } = new leven(cur, command);
        return distance < acc[0] ? [distance, cur] : acc;
      }, [3, ""])[1];
    return dym ?
      message.reply(Messages.SimilarMessage + dym) :
      void 0;
  };
});

client.on('voiceStateUpdate', async (old, now) => {
  if (now.id === client.user.id) {
    if (!old.channel && now.channel) {
      // join
      console.log("join!");
      if (now.channel.type === "stage")
        now.setSuppressed(false);
    } else if (old.channel && !now.channel) {
      // leave
      console.log("leave!");
      queues.delete(now.guild.id);
    } else if (old.channel.id !== now.channel.id) {
      // move
      console.log("move!");
      if (now.channel.type === "stage")
        now.setSuppressed(false);
    }
  } else {
    
  }
});