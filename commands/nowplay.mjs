export default (message => {
  const serverQueue = queues.get(message.guild.id);
  const song = serverQueue.playingSong;
  if(!song) return void await message.reply(Messages.NoMusic);
  const embed = new MessageEmbed()
  .setTitle(song.title)
  .setAuthor(song.member.user.tag, song.member.user.avatarURL({size:512, format:'png'}) )
  .setURL(song.url)
  .setThumbnail(song.thumbnail.url)
  .setFooter(song.author.name, song.author.thumbnails[0].url)
  .setDescription(secformat(serverQueue.dispatcher.streamTime / 1000) + ' / ' + secformat(song.duration))
  .setColor(0x00ff00);
  message.channel.send([embed]);
})

function secformat(number) {
  var dt = new Date(number * 1000).toISOString();
  var fm = dt
    .replace(/T/, "")
    .replace(/\..+/, "")
    .replace(/\d\d\d\d-\d\d-\d\d/, "");
  return fm;
}
