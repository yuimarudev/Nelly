global.Discord = require('discord.js');
global.fs = require('fs');
global.ytdl = require('ytdl-core');
const leven = require('levenshtein');
const path = require('path');
const dotenv = require('dotenv');
const SpaceSplit = require('./spliter.js');
const commandArgs = require('./commands.json');
const commands = {};
const prefix = '%';
["Client", "MessageEmbed", "Intents", "MessageAttachment"]
  .forEach(v => global[v] = Discord[v]);

const env = dotenv.parse(fs.readFileSync(path.join(__dirname, '.env')));
global.client = new Client({
  intents: Intents.NON_PRIVILEGED,
  ws: {
    intents: Intents.NON_PRIVILEGED,
    properties: {
        $browser: 'Discord Android'
    }
  }
});
global.queue = new Map();

for(let key in env) {
  process.env[key] = env[key];
};

process.stdin.on('data', chunk => {
  chunk = String(chunk);
  if(typeof chunk.match === "function" && chunk.match('sine')) {
    console.log('グハッ！');
    process.exit();
  };
});

client.on('ready', () => {
  console.log('Please wait.............');
  let list = fs.readdirSync(path.join(__dirname, 'commands'))
    .filter(x => x.endsWith('.js'))
    .map(x => x.replace(/\.js$/,''));
  for (let command of list) {
    let run = require(path.join(__dirname, 'commands', command));
    commands[command] = run;
    console.log('loaded \'' + command + '\'');
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
  if(message.author.bot) return;
  if(!message.content.startsWith(prefix) && !message.mentions.users.has(client.user.id))
    return;
  message.content = message.content.replace(new RegExp(`^<@!?${client.user.id}`), prefix);
  const args = SpaceSplit(message.content.slice(prefix.length));
  let command = args.shift();
  const commandDict = commandArgs.commands;
  const aliasList = Object.keys(commandArgs.aliases);
  const curs = (command in commandDict ? command : false) || (aliasList[command] in commandDict ? aliasList[command] : false);
  if (curs) {
    let cursor = commandArgs.commands[curs];
    if (cursor.args.some(x => x.length === args.length)) {
      let result;
      try {
        result = await commands[curs](message, args, client);
      } catch(ex) {
        result = ':x: おっと、なにかが上手くいかなかったみたいですね\nエラー内容: ```js\n' + ex.message + '\n```';
      };
      if (result) return message.channel.send(result);
    } else {
      return message.reply(':x: 引数が間違っています。引数は`' + prefix + 'help ' + command + '`で確認してください。');
    };
  } else {
    let dym = Object.keys(commandDict)
      .reduce((acc, cur) => {
        let { distance } = new leven(cur, curs);
        return distance < acc[0] ? [distance, cur] : acc;
      }, [3, ""])[1];
     return dym ?
     message.reply(':thinking: コマンドを間違えているようです。\nもしかして: ' + dym) :
     void 0;
  };
});

client.login(process.env.token);
