module.exports = async message => {
  const serverQueue = queues.get(message.guild.id);
  if (!serverQueue) {
    return void await message.reply(
      ":x: There is no queue."
    );
  }
  const songs = serverQueue.songs.length ?
    serverQueue.songs
    .map(s => `・[${s.title}](${s.url})[<@${s.member.id}>]`)
    .join('\n'):
    "The queue is empty";
  await message.channel.send({ embed: {
    title: "Queue",
    description: songs
  }});
};
