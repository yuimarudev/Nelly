module.exports = async(message) => {
  const serverQueue = queues.get(message.guild.id);
  const song = serverQueue.songs.first();
  const embed = new MessageEmbed()
  .setTitle(song.title)
  .setAuthor(song.author)
  .setURL(song.url)
  message.channel.send([embed]);
};
