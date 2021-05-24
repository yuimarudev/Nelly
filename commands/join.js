const Queue = require('../structure/Queue.js');

module.exports = async message => {
    message.member.voice?.channel.join()
      .then(conn => queues.set(message.guild.id, new Queue(message, conn)))
      .catch(err => message.channel.send(`${Messages.AccidentMessage}\nエラー内容: ${err}`))
    ? void 0
    : message.channel.send(Messages.PleaseJoinVoiceChannelMessage)
}
