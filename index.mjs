import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { on } from 'events';
import leven from 'levenshtein';
import SpaceSplit from './spliter.mjs';
import commandArgs from './commands.js';
import MessageComponentInteraction from './structure/MessageComponentInteraction.mjs';
import {
  MessageEmbed,
  MessageAttachment,
  Discord,
  Messages,
  stringFormat,
  queues,
  client
} from './global.mjs';
globalThis.timeouts = [];
globalThis.intervals = [];

const commands = {};

const prefix = '%';

let dotenvURL = new URL("./.env",import.meta.url);
if (fs.existsSync(dotenvURL)) {
  const env = dotenv.parse(fs.readFileSync(dotenvURL));
  for (let key in env) {
    process.env[key] = env[key];
  }
}

process.stdin.on('data', chunk => {
  chunk = String(chunk);
  if (typeof chunk.match === "function" && chunk.match('sine')) {
    console.log("グハッ！");
    process.exit(-1); // eslint-disable-line
  };
});

client.on('ready', async () => {
  console.log("ちょっと待ってね！(   ◜ω◝ )");
  let list = fs.readdirSync(new URL("./commands", import.meta.url))
    .filter(x => x.endsWith('.mjs') || x.endsWith('.js'))
  for (let command of list) {
    const run = await import(new URL(`./commands/${command}`, import.meta.url));
    commands[command.replace(/.(m)?js$/, '')] = run.default;
    console.log('\'' + command + '\'' + "を読み込んだよ！");
  };
  console.log('ready');
  setInterval(() => {
    client.user.setActivity(client.guilds.cache.size + 'guilds', { type: 'COMPETING' });
    setTimeout(() => {
      client.user.setActivity('ready At: ' + client.readyAt);
    }, 3000);
  }, 6000);
});

client.on('message', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix) && !message.mentions.users.has(client.user.id))
    return;
  message.content = message.content.replace(new RegExp(`^<@!?${client.user.id}>\s?`), prefix);
  if (message.content.startsWith(prefix + "eval")) {
    try {
      await commands.eval(message, message.content.replace(prefix + "eval", ""), client);
    } catch (ex) {
      await message.reply(Messages.SomethingWentWrong + '\nエラー内容: ```js\n' + ex.message + '\n```');
    }
    return;
  }
  if (message.content.startsWith(prefix + "safeeval")) {
    try {
      await commands.safeeval(message, message.content.replace(prefix + "safeeval", ""), client);
    } catch (ex) {
      await message.reply(Messages.SomethingWentWrong + '\nエラー内容: ```js\n' + ex.message + '\n```');
    }
    return;
  }
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
        result = Messages.SomethingWentWrong + '\nエラー内容: ```js\n' + ex.message + '\n```';
      };
      if (result) return message.channel.send(result);
    } else {
      return message.reply(stringFormat(Messages.InvalidArgMessage, curs));
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
  if (now.id !== client.user.id) return;
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
});

client.on('interaction', async interaction => {
  if (interaction.isCommand()) {
    // Slash Commands
    interaction.reply("Catch!");
  } else if (interaction.isMessageComponent) {
    // from Buttons
    if (interaction.customID == "delete_the_message") {
      await interaction.reply({ content: "Deleted!", ephemeral: true });
      return void await interaction.message.delete();
    } else if (interaction.customID == "remove_the_buttons") {
      await interaction.reply({ content: "Removed!", ephemeral: true });
      return void await client.api.channels[interaction.channel.id]
        .messages[interaction.message.id].patch({
          data: { components: [] }
        });
    } else if (interaction.customID == "right_choice") {
      interaction.reply({ content: ":white_check_mark: 正解！", ephemeral: true });
    } else if (interaction.customID == "wrong_choice") {
      interaction.reply({ content: ":x: 不正解...", ephemeral: true });
    }
  }
});

MessageComponentInteraction.addHandler(client);
