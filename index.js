global.Discord = require('discord.js');
global.Messages = require('./lang/ja_jp.json');
global.stringFormat = (...r) =>
r.reduce((a, c, i) => a.replace(
  new RegExp(`\\{${i}\\}`, "g"), c
), r.shift());
const fs = require('fs');
const leven = require('levenshtein');
const path = require('path');
const dotenv = require('dotenv');
const SpaceSplit = require('./spliter.js');
const commandArgs = require('./commands.js');
const commands = {};
const prefix = '%';
["Client", "MessageEmbed", "MessageAttachment"]
  .forEach(v => global[v] = Discord[v]);

let dotenvPath = path.join(__dirname, '.env');
if (fs.existsSync(dotenvPath)) {
  const env = dotenv.parse(fs.readFileSync(dotenvPath));
  for(let key in env) {
    process.env[key] = env[key];
  }
}
global.client = new Client({
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
    console.log(Messages.KilledMessage);
    process.exit();
  };
});

client.on('ready', () => {
  console.log(Messages.PleaseWait);
  let list = fs.readdirSync(path.join(__dirname, 'commands'))
    .filter(x => x.endsWith('.js'))
    .map(x => x.replace(/\.js$/,''));
  for (let command of list) {
    let run = require(path.join(__dirname, 'commands', command));
    commands[command] = run;
    console.log('\'' + command + '\'' + Messages.LoadedMessage);
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
  message.content = message.content.replace(new RegExp(`^<@!?${client.user.id}`), prefix);
  if (message.content.startsWith(prefix + "eval")) {
    commands.eval(message, message.content.replace(prefix + "eval", ""), client);
    return;
  }
  const args = SpaceSplit(message.content.slice(prefix.length));
  let command = args.shift();
  const commandDict = commandArgs.commands;
  const aliasList = commandArgs.aliases;
  const curs = (command in commandDict ? command : false) || (aliasList[command] in commandDict ? aliasList[command] : false);
  if (curs) {
    let cursor = commandArgs.commands[curs];
    if (cursor.variadic || cursor.args.some(x => x.length === args.length)) {
      let result;
      try {
        result = await commands[curs](message, args, client);
      } catch(ex) {
        result = Messages.SomethingWentWrong + '\nエラー内容: ```js\n' + ex.message + '\n```';
      };
      if (result) return message.channel.send(result);
    } else {
      return message.reply(stringFormat(Messages.InvalidArgMessage, command));
    };
  } else {
    let dym = Object.keys(commandDict)
      .reduce((acc, cur) => {
        let { distance } = new leven(cur, command);
        return distance < acc[0] ? [distance, cur] : acc;
      }, [3, ""])[1];
     return dym ?
     message.reply(Messages.SimilarMessage + dym) :
     void 0;
  };
});

client.on('voiceStateUpdate', (old, now) => {
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

client.login(process.env.token);
