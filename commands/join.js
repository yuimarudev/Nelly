async module.exports = (client, _, message) => {
    message.member.voice.channel.join()
      .then(conn => queue.set(message.guild.id, conn))
      .catch(err => message.channel.send(`おっと、問題が発生したみたいですね\n内容: ${err}`))
}