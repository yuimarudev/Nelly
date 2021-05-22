const Queue = require('../structure/Queue.js');

module.exports = async message => {
    message.member.voice?.channel.join()
      .then(conn => queues.set(message.guild.id, new Queue(message, conn)))
      .catch(err => message.channel.send(`おっと、問題が発生したみたいですね\nエラー内容: ${err}`))
    ? void 0
    : message.channel.send('ボイスチャンネルに参加してください(  ˙༥˙  )')
}
