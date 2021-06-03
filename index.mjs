import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { on } from 'events';
import leven from 'levenshtein';
import discord from 'discord.js';

["MessageEmbed", "MessageAttachment"]
  .forEach(v => global[v] = discord[v]);
global.Discord = discord;
global.Messages = JSON.parse(fs.readFileSync('./lang/ja_jp.json'));
global.stringFormat = (...r) =>
r.reduce((a, c, i) => a.replace(
  new RegExp(`\\{${i}\\}`, "g"), c
), r.shift());
console.log(global);
import SpaceSplit from './spliter.mjs';
import commandArgs from './commands.js';
import extClasses from './ModifyDjs.mjs';
import MessageComponentInteraction from './structure/MessageComponentInteraction.mjs';

Object.assign(global, extClasses);
Object.assign(Discord, extClasses);

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const commands = {};

// events
const ready = on(
  client,
  'ready'
);
const messageEvent = on(
  client,
  'message'
);
const voiceStateUpdate = on(
  client,
  'voiceStateUpdate'
);
const interactionEvent = on(
  client,
  'interaction'
);

const prefix = '%';

let dotenvPath = path.join(__dirname, '.env');
if (fs.existsSync(dotenvPath)) {
  const env = dotenv.parse(fs.readFileSync(dotenvPath));
  for(let key in env) {
    process.env[key] = env[key];
  }
}
const client = new Discord.Client({
  intents: Discord.Intents.NON_PRIVILEGED,
  ws: {
    intents: Discord.Intents.NON_PRIVILEGED,
    properties: {
        $browser: 'Nelly Client'
    }
  }
});

global.queues = new Discord.Collection();

process.stdin.on('data', chunk => {
  chunk = String(chunk);
  if(typeof chunk.match === "function" && chunk.match('sine')) {
    console.log("グハッ！");
    process.exit(-1); // eslint-disable-line
  };
});

for await (let _ of ready) {
  _;
  console.log("ちょっと待ってね！(   ◜ω◝ )");
  let list = fs.readdirSync(path.join(__dirname, 'commands'))
    .filter(x => x.endsWith('.mjs') || x.endsWith('.js'))
  for (let command of list) {
    let run = await import(path.join(__dirname, 'commands', command));
    commands[command] = run;
    console.log('\'' + command + '\'' + "を読み込んだよ！");
  };
  console.log('ready');
  setInterval(() => {
    client.user.setActivity(client.guilds.cache.size + 'guilds', { type: 'COMPETING' });
    setTimeout(() => {
      client.user.setActivity('ready At: ' + client.readyAt);
    }, 3000);
  }, 6000);
};

for await (let [message] of messageEvent) {
  if (message.author.bot) continue;
  if (!message.content.startsWith(prefix) && !message.mentions.users.has(client.user.id))
    continue;
  message.content = message.content.replace(new RegExp(`^<@!?${client.user.id}`), prefix);
  if (message.content.startsWith(prefix + "eval")) {
    try {
        await commands.eval(message, message.content.replace(prefix + "eval", ""), client);
    } catch(ex) {
        await message.reply(Messages.SomethingWentWrong + '\nエラー内容: ```js\n' + ex.message + '\n```');
    }
    continue;
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
        result = await commands[curs](message, args, client);
      } catch(ex) {
        result = Messages.SomethingWentWrong + '\nエラー内容: ```js\n' + ex.message + '\n```';
      };
      if (result) {
        message.channel.send(result);
        continue;
      };
    } else {
      message.reply(stringFormat(Messages.InvalidArgMessage, curs));
      continue;
    };
  } else {
    let dym = Object.keys(commandDict).concat(Object.keys(aliasDict).filter(alias => 2 < alias.length))
      .reduce((acc, cur) => {
        let { distance } = new leven(cur, command);
        return distance < acc[0] ? [distance, cur] : acc;
      }, [3, ""])[1];
    dym ?
     message.reply(Messages.SimilarMessage + dym) :
     void 0;
    continue;
  };
};

for await (let [old, now] of voiceStateUpdate) {
  if (now.id !== client.user.id) continue;
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
};

for await (let [interaction] of interactionEvent) {
  if (interaction.isCommand()) {
    // Slash Commands
    interaction.reply("Catch!");
  } else if (interaction.isMessageComponent) {
    // from Buttons
    if (interaction.customID == "delete_the_message") {
      await interaction.reply("Deleted!", { ephemeral: true });
      void await interaction.message.delete();
      continue;
    } else if (interaction.customID == "remove_the_buttons") {
      await interaction.reply("Removed!", { ephemeral: true });
      void await client.api.channels[interaction.channel.id]
      .messages[interaction.message.id].patch({
        data: { components: [ ] }
      });
      continue;
    } else if (interaction.customID == "right_choice") {
      interaction.reply(":white_check_mark: 正解！", { ephemeral: true });
    } else if (interaction.customID == "wrong_choice") {
      interaction.reply(":x: 不正解...", { ephemeral: true });
    }
  }
};

MessageComponentInteraction.addHandler(client);
client.login(process.env.token);
