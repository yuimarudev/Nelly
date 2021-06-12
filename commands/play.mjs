import {
  MessageEmbed,
  MessageAttachment,
  Discord,
  Messages,
  stringFormat,
  queues
} from '../global.mjs';

import Queue from '../structure/Queue.mjs';
import ytsr from 'ytsr';
import ytpl from 'ytpl';
const regex = /https?:\/\/youtu(?:be\.com|\.be)\/(?:watch\?v=(\w{1,}))?(?:&?[^\?list=]\w+)*(?:(?:&|\?|play)list(?:\?|=)(\w{0,}))?.*/; // eslint-disable-line

export default (async(message, args, client) => {
  const data = queues.get(message.guild.id);
  if (!data) {
    if (message.member.voice.channel) {
      message.member.voice.channel.join()
        .then(conn => {
        queues.set(message.guild.id, new Queue(message, conn));
        client.emit('message', message);
      })
        .catch(err => message.channel.send(`おっと、エラーが発生したみたいですね\nエラー内容: ${err}`))
    } else {
      message.channel.send(Messages.PleaseJoinVoiceChannelMessage);
      const func = function (_, newState) {
        if (
          newState.channel &&
          newState.member.id === message.member.id
        ) newState.channel.join()
          .then(conn => {
          queues.set(message.guild.id, new Queue(message, conn));
          client.emit('message', message);
        })
          .catch(err => message.channel.send(`${Messages.SomethingWentWrong}\nエラー内容: ${err}`))
      }
      client.on('voiceStateUpdate',func)
      setTimeout(() => client.off('voiceStateUpdate',func), 10000);
    }
  } else {
    const matched = args[0].match(regex);
    const serverQueue = queues.get(message.guild.id);
    if (!matched) {
      const result = await ytsr.getFilters(args[0]).then(f => ytsr(f.get('Type').get('Video').url,{
        gl: "JP",
        hl: "ja",
        limit: 10
      }));
      const filtered = result.items.filter(({duration}) => 
                                           duration.split(':').length <= 2 &&
                                           +duration.split(':')[0] < 31
                                          );
      if (!result || !filtered.length)
        return void await message.reply(Messages.NoVideoResult);
      let song = await serverQueue.addMusic(filtered[0].url, message).catch(e => {
        return message.channel.send(Messages.NoVideoResult + "\nError:```" + e + "```");
      });
      await message.channel.send(Messages.MusicAdded + song.title);
    } else if (!matched[2]) {
      let song = await serverQueue.addMusic(matched[0], message).catch(e => {
        return message.channel.send(Messages.NoVideoResult + "\nError:```" + e + "```");
      });
      await message.channel.send(Messages.MusicAdded + song.title);
    } else {
      let playlist = await ytpl(args[0]), addCount = 0;
      for (let v of playlist.items) {
        await serverQueue.addMusic(v.url, message).then(() => addCount++, () => 0);
        await delay(1500);
      }
      await message.channel.send(
        Messages.MusicAdded + (1 < addCount ? `${addCount} songs!` : `${addCount ? 1 : "no"} song!`)
      );
    }
  }
})

function delay(ms) {
  if (typeof ms !== "number" || ms < 1) ms = 1000;
  return new Promise(r => setTimeout(r, ms));
}
