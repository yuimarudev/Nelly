const Song = require('../structure/Song.js');

module.exports = async(message, args, client) => {
    const data = queues.get(message.guild.id);
    if (!data) {
        message.member.voice.channel
          ? message.member.voice.channel.join()
              .then(conn => queues.set(message.guild.id, new Queue(message, conn)))
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
        if (matched[1]) {
            // プレイリストのurlだった場合の処理
        } else if (matched[0]) {
            await serverQueue.addMusic(args[2]).catch(e => {
              return message.reply("(そんな動画)ないです。\nエラー:```" + e + "```");
            });
        } else {
            // 検索ワードの処理
        }
    }
}
