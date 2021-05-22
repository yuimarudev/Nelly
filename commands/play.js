module.exports = (message, args, client) => {
    const data = queue.get(message.guild.id);
    if (!data) {
        message.member.voice.channel
          ? message.member.voice.channel.join()
              .then(conn => queue.set({}))
              .catch(err => message.channel.send(`おっと、エラーが発生したみたいですね\nエラー内容: ${err}`))
          : () => {
              message.channel.send('ボイスチャンネルに参加してください');
              const func = function (_, newState) {
                  if (
                      newState.member.voice.channel &&
                      newState.member.id === message.member.id
                  ) message.member.voice.channel.join()
                      .then(conn => {
                          queue.set(message.guild.id, {});
                          client.emit('message',message);
                      })
                      .catch(err => message.channel.send(`おっと、エラーが発生したみたいですね\nエラー内容: ${err}`))
              }
              client.on('voiceStateUpdate',func)
              setTimeout(() => client.off('voiceStateUpdate',func), 10000);
          }
    } else {
        const {} = data
    }
}