module.exports = async message => {
  const serverQueue = queues.get(message.guild.id);
  if (!serverQueue) {
    return void await message.reply(
      ":x: There is no queue."
    );
  }
  const np = serverQueue.playingSong;
  const nowPlayingText = np ? `**Now playing:** [${np.title}](${np.url})` : "";
  const texts = serverQueue.songs.length ? serverQueue.songs.reduce((a, v, i) => {
    const addtxt = `${i + 1}. [${v.title}](${v.url})`;
    if (1700 < (a[a.length - 1] + "\n" + addtxt).length) {
      a.push(addtxt);
    } else {
      a[a.length - 1] += "\n" + addtxt;
    }
    return a;
  }, [nowPlayingText]) : ["The queue is empty."];
  for (let i = 0; i < texts.length; i++)
  await message.channel.send(
    new MessageEmbed()
    .setTitle(`Queue (${i + 1}/${texts.length})`)
    .setDescription(texts[i])
  );
};
