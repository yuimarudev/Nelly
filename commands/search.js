const Queue = require('../structure/Queue.js');
const ytsr = require('ytsr');

module.exports = async(message, args, client) => {
    const serverQueue = queues.get(message.guild.id);
    if (!serverQueue) {
        if (message.member.voice.channel) {
            message.member.voice.channel.join()
            .then(conn => {
                queues.set(message.guild.id, new Queue(message, conn));
                client.emit('message', message);
            })
            .catch(err => message.channel.send(`${Messages.AccidentMessage}\nエラー内容: ${err}`));
        } else {
            message.channel.send(Messages.PleaseJoinVoiceChannelMessage);
            const func = function (_, newState) {
                if (
                    newState.member.voice.channel &&
                    newState.member.id === message.member.id
                ) message.member.voice.channel.join()
                .then(conn => {
                    queues.set(message.guild.id, new Queue(message, conn));
                    client.emit('message', message);
                })
                .catch(err => message.channel.send(`${Messages.AccidentMessage}\nエラー内容: ${err}`))
            }
            client.on('voiceStateUpdate',func)
            setTimeout(() => client.off('voiceStateUpdate',func), 10000);
        }
    } else {
        if (message.member.voice.channel.id != serverQueue.voiceChannel.id) {
            return void await message.reply(Messages.PleaseJoinVoiceChannelMessage + `\nVC: \`${serverQueue.voiceChannel.name}\``)
        }
        const { connection, textChannel, voiceChannel } = serverQueue;
        const result = await ytsr.getFilters(args[0]).then(f => ytsr(f.get('Type').get('Video').url,{
            gl: "JP",
            hl: "ja",
            limit: 20
        }));
        const filtered = result.items.filter(({duration}) => duration && duration?.split(':').length <= 2 && 6 >+ duration?.split(':')[0]);
        if (!result || !filtered.length)
        return void await message.reply(Messages.NoSearchResult);
        filtered.length>=9?filtered.length=9:null;
        textChannel.send(
            new MessageEmbed()
            .setTitle("Found")
            .setDescription(filtered.map(({title, url, duration}, i) =>`${i + 1}\u{fe0f}\u{20e3}：\t[${title}](${url})\r\t\t[${duration}]`).join('\n'))
        )
        .then(async ({channel}) => {
            const messages = await channel.awaitMessages(
                ({ author, content }) =>
                author.equals(message.author) &&
                0 < content.normalize('NFKC') &&
                content.normalize('NFKC') <= filtered.length ||
                content.normalize('NFKC').match(/^(cancel|キャンセル)$/i),
                { max: 1, time: 3e4 }
            );
            if (messages.size) {
                const songInfo = filtered?.[messages.first().content - 1];
                songInfo 
                    ? (async () => {
                        serverQueue.addMusic(songInfo.url, message);
                        await message.reply(Messages.MusicAdded + songInfo.title);
                    })()
                    : message.channel.send('キャンセルしました( ◜௰◝  ）');
            } else {
                message.channel.send(Messages.TimedOut);
            }
        });
    }
}

function delay(ms) {
  return (typeof ms !== "number" || ms < 1) ?
  Promise.resolve(void 0) :
  new Promise(r => setTimeout(r, ms));
}
