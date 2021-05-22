module.exports = async (message, _, _) => {
    message.member.voice.channel.join()
      .then(conn => queue.set(message.guild.id, conn))
      .catch(err => message.channel.send(`おっと、問題が発生したみたいですね\nエラー内容: ${err}`))
}
