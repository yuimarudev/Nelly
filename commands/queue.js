module.exports = async message => {
  const serverQueue = queues.get(message.guild.id);
  if (!serverQueue) {
    return void await message.reply(
      ":x: There is no queue."
    );
  }
  const np = serverQueue.playingSong;
  const nowPlayingText = np ? `**Now playing:** [${np.title}](${np.url})` : "";
  const songs = serverQueue.songs;
  const texts = songs.length ? songs.reduce((a, v, i) => {
    const addtxt = `${i + 1}. [${s.title}](${s.url})`;
    if (1700 < (a[a.length - 1] + "\n" + addtxt).length) {
      a.push(addtxt);
    } else {
      a[a.length - 1] += "\n" + addtxt;
    }
    return a;
  }, [nowPlayingText]) : ["The queue is empty."];
  for (let i = 0; i < texts.length; i++)
  await message.channel.send({ embed: {
    title: `Queue (${i + 1)/${texts.length})`,
    description: texts[i]
  }});
};
