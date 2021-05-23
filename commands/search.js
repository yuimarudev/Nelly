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
      const serverQueue = queues.get(message.guild.id);
          const result = await ytsr.getFilters(args[0]).then(f => ytsr(f.get('Type').get('Video').url,{
              gl: "JP",
              hl: "ja",
              limit: 10
          }));
          const filtered = result.items.filter(({duration}) => 
             duration.split(':').length <= 2 &&
             6 >+ duration.split(':')[0]
          );
          if (!result || !filtered.length)
          return void await message.reply(":x: No result...");
          textChannel.send(new MessageEmbed({
             title: 'found',
             description: `0: ${filtered.map(({title, url}, i) =>
                  `${i}: [${title}](${url})`
             ).join('\n')}`
          })).then(async ({channel}) => {
              const i = await channel.awaitMessages(
                  ({ author, content }) => author.equals(message.author) && content <= filtered.length,
                  { max: 1, time: 3e4 }
              );
              i.size
               ? serverQueue.addMusic(filtered[i].url, message)
               : message.channel.send('タイムアウトしました( ◜௰◝  ）');
          })
    }
}

function delay(ms) {
  if (typeof ms !== "number" || ms < 1) ms = 1000;
  return new Promise(r => setTimeout(r, ms));
}
