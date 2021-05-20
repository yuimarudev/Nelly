const discord = require('discord.js');
const levens = require('levenshtein');
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

client.on('ready', () => {
  let list = fs.readdirSync(path.join(__dirname, 'commands'))
    .map(x => x.replace(/\.js$/,''));
  for(command of list){
    let run = require(path.join(__dirname, 'commands', command));
    commands[command] = run;
    console.log('loaded \'' + command + '\'');
  };
});

client.on('message', message => {
  if(message.author.bot || message.system || (!message.content.startsWith(prefix) || (!message.mentions.users.has(client.user) && !message.content.match(new RegExp(`<@!?${client.user.id}>`)))))
    return;
});
