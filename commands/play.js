const Queue = require('../structure/Queue.js');
const ytsr = require('ytsr');

module.exports = async(message, args, client) => {
    const data = queues.get(message.guild.id);
    if (!data) {
        message.member.voice.channel
          ? message.member.voice.channel.join()
              .then(conn => {
                   queues.set(message.guild.id, new Queue(message, conn));
                   client.emit('message', message);
              })
              .catch(err => message.channel.send(`おっと、エラーが発生したみたいですね\nエラー内容: ${err}`))
          : () => {
              message.channel.send('ボイスチャンネルに参加してください');
              const func = function (_, newState) {
                  if (
                      newState.member.voice.channel &&
                      newState.member.id === message.member.id
                  ) message.member.voice.channel.join()
                      .then(conn => {
                          queues.set(message.guild.id, new Queue(message, conn));
                          client.emit('message', message);
                      })
                      .catch(err => message.channel.send(`おっと、エラーが発生したみたいですね\nエラー内容: ${err}`))
              }
              client.on('voiceStateUpdate',func)
              setTimeout(() => client.off('voiceStateUpdate',func), 10000);
          }
    } else {
        const { connection, textChannel, voiceChannel } = data;
        const matched = args[0].match(regex);
        const serverQueue = queues.get(message.guild.id);
        if (!matched) {
            const result = await ytsr(args[0]);
            if (!result || !result.refinements || !result.refinements.length)
            return void await message.reply(":x: No result...");
            let song = await serverQueue.addMusic(result.refinements[0].url, message).catch(e => {
              return message.reply("(そんな動画)ないです。\nエラー:```" + e + "```");
            });
            await message.reply(":white_check_mark: Added: " + song.title);
        } else if (!matched[2]) {
            let song = await serverQueue.addMusic(matched[0], message).catch(e => {
              return message.reply("(そんな動画)ないです。\nエラー:```" + e + "```");
            });
            await message.reply(":white_check_mark: Added: " + song.title);
        } else {
            // プレイリストのurlだった場合の処理
        }
    }
}
