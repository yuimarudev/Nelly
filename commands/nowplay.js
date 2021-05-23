module.exports = async(message) => {
  const serverQueue = queues.get(message.guild.id);
  const song = serverQueue.playingSong;
  if(!song) return void await message.reply('曲がありません(´ω`)');
  const embed = new MessageEmbed()
  .setTitle(song.title)
  .setAuthor(song.member.tag, song.member.user.avatarURL({size:512, format:'png'}) )
  .setURL(song.url)
  .setThumbnail(song.thumbnail.url)
  .setFooter(song.author.name, song.author.thumbnails[0].url)
  .setDescription(secformat(serverQueue.dispatcher.streamTime) + ' / ' + secformat(song.duration))
  .setColor(0x00ff00);
  message.channel.send([embed]);
};

function secformat(number) {
  var dt = new Date(number * 1000).toISOString();
  var fm = dt
    .replace(/T/, "")
    .replace(/\..+/, "")
    .replace(/\d\d\d\d-\d\d-\d\d/, "");
  return fm;
}
