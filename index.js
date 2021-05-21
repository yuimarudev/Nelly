const discord = require('discord.js');
const leven = require('levenshtein');
const fs = require('fs');
const path = require('path');
const commandArgs = require('./commands.json');
const commands = {};
const prefix = '%';
const { Client, MessageEmbed, Intents, MessageAttachment } = discord;
global.client = new Client({
  intent: Intents.NON_PRIVILEGED,
  ws: {
    intent: Intents.NON_PRIVILEGED
  }
});
global.queue = new Map();

client.on('ready', () => {
  let list = fs.readdirSync(path.join(__dirname, 'commands'))
    .map(x => x.replace(/\.js$/,''));
  for(let command of list){
    let run = require(path.join(__dirname, 'commands', command));
    commands[command] = run;
    console.log('loaded \'' + command + '\'');
  };
});

client.on('message', async message => {
  if(message.author.bot || message.system || (!message.content.startsWith(prefix) || (!message.mentions.users.has(client.user) && !message.content.match(new RegExp(`<@!?${client.user.id}>`)))))
    return;
  const args = SpaceSplit(message.content.slice(prefix.length));
  const command = args.shift();
  const commandList = Object.keys(commands.commands);
  const aliasList = Object.keys(commands.aliases);
  const cur = commandList.includes(command) || commandList.includes(aliasList[command]);
  if (cur) {
    let cursor = commandArgs[command];
    if (cursor.args.some(x => x.length === args.length)) {
      let result;
      try {
        result = await commands.commands[command](message, args, client);
      } catch(ex) {
        result = ':x: Something went wrong.....\nInfo: ' + ex.message;
      };
      if(result) return message.channel.send(result);
    } else {
      return message.reply(':x: 引数が間違っています。引数は`' + prefix + 'help ' + command + '`で確認してください。');
    };
  } else {
    let dym = commandList
      .reduce((acc, cur) => {
        let { distance } = new leven(cur, input);
        return distance < acc[0] ? [distance, cur] : acc;
      }, [3, ""])[1];
     return dym ?
     message.reply(':thinking: コマンドを間違えているようです。\nもしかして: ' + dym) :
     void 0;
  };
});
