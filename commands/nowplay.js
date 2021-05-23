module.exports = async(message) => {
  const serverQueue = queues.get(message.guild.id);
  const song = serverQueue.playingSong;
  if(!song) return void await message.reply('曲がありません(´ω`)');
  const embed = new MessageEmbed()
  .setTitle(song.title)
  .setAuthor(song.member.tag, song.member.user.avatarURL({size:512, format:'png'}) )
  .setURL(song.url)
  .setThumbnail(song.thumbnail)
  .setFooter(song.author.thumbnails.first().url, song.author.name)
  .setDescription(serverQueue.dispatcher.streamTime + '/' + song.duration)
  .setColor(0x00ff00);
  message.channel.send([embed]);
};
