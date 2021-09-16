import {
  MessageEmbed,
  MessageAttachment,
  Discord,
  Messages,
  stringFormat,
  queues
} from '../global.mjs';

import Queue from '../structure/Queue.mjs';
import { joinVoiceChannel } from "@discordjs/voice"
 export default (async message => {
   if (!message.member.voice.channel) {
     return void await message.reply(Messages.PleaseJoinVoiceChannelMessage);
   }
   joinVoiceChannel({
     guildId: message.guild.id,
     channelId: message.member.voice.channel.id,
     adapterCreator: message.guild.voiceAdapterCreator,
     selfMute: false
   })
   message.member.voice.channel.join()
     .then(conn => queues.set(message.guild.id, new Queue(message, conn)))
     .catch(err => message.channel.send(`${stringFormat(AccidentMessage, "```" + err + "```")}`));
})
