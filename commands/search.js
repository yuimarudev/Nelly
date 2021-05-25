const Queue = require('../structure/Queue.js');
const ytsr = require('ytsr');

module.exports = async(message, args, client) => {
    const data = queues.get(message.guild.id);
    if (!data) {
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
        const { connection, textChannel, voiceChannel } = data;
        const serverQueue = queues.get(message.guild.id);
        const result = await ytsr.getFilters(args[0]).then(f => ytsr(f.get('Type').get('Video').url,{
            gl: "JP",
            hl: "ja",
            limit: 10
        }));
        const filtered = result.items.filter(({duration}) => duration.split(':').length <= 2 && 6 >+ duration.split(':')[0]);
        if (!result || !filtered.length)
        return void await message.reply(Messages.NoSearchResult);
        textChannel.send(
            new MessageEmbed()
            .setTitle(found)
            .setDescription(filtered.map(({title, url}, i) =>`${i + 1}: [${title}](${url})`).join('\n'))
        )
        .then(async ({channel}) => {
            const i = await channel.awaitMessages(
                ({ author, content }) => author.equals(message.author) && 0 < content && content <= filtered.length,
                { max: 1, time: 3e4 }
            );
            // console.log(filtered.map(({title, url}) => [title, url]));
            if (i.size) {
                const songInfo = filtered[i.first().content - 1];
                serverQueue.addMusic(songInfo.url, message);
                await message.reply("Added: " + songInfo.title);
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
