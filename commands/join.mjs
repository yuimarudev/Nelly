import {
  MessageEmbed,
  MessageAttachment,
  Discord,
  Messages,
  stringFormat,
  queues
} from '../global.mjs';

import Queue from '../structure/Queue.mjs';

 export default (async message => {
   if (!message.member.voice.channel) {
     return void await message.reply(Messages. PleaseJoinVoiceChannelMessage);
   }
   message.member.voice.channel.join()
     .then(conn => queues.set(message.guild.id, new Queue(message, conn)))
     .catch(err => message.channel.send(`${Messages.AccidentMessage}\nエラー内容: ${err}`));
})
