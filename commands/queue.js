module.exports = async message => {
  const serverQueue = queues.get(message.guild.id);
  if (!serverQueue) {
    return void await message.reply(
      ":x: The queue is empty."
    );
  }
  const songs = [...serverQueue.values()].map(s => `[${s.title}](${s.url})`);
  await message.channel.send({ embed: {
    title: "Queue",
    description: songs.join('\n')
  }});
};
