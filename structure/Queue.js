const Song = require('./Song.js');
const ytdl = require('ytdl-core');

module.exports = class {
  constructor(message, connection=null) {
    this.textChannel = message.channel;
    this.voiceChannel = message.member.voice.channel;
    this.connection = connection;
    this.songs = [];
    this.loop = false;
    this.volume = 5;
    this.playingSong = null;
    this.isPlaying = false;
    this.dispatcher = null;
    this.autoplay = false;
    this.skipReqs = new Set();
    this.autoPlayHistory = [];
  }
  async addMusic(url, message) {
    const info = await ytdl.getInfo(url);
    const song = new Song(info, message);
    this.songs.push(song);
    if (!this.isPlaying && this.connection) play(this);
    return song;
  }
}

async function play(queue) {
  if (!queue.songs.length) {
    queue.isPlaying = false;
    queue.playingSong = null;
    queue.dispatcher = null;
    await queue.textChannel.send("Queue Finished...");
    return;
  }
  queue.isPlaying = true;
  queue.skipReqs.clear();
  const song = queue.playingSong = queue.songs.shift();
  const stream = ytdl.downloadFromInfo(song._info)
  .once('error', async err => {
    queue.textChannel.send(
      new MessageEmbed()
      .setTitle(":x: Exception")
      .setDescription(`${err}`)
    );
    await next();
  });
  queue.nowPlayingMsg = await queue.textChannel.send(
    new MessageEmbed()
    .setTitle("Now Playing")
    .setDescription(`[${song.title}](${song.url})`)
    .setThumbnail(song.thumbnail.url)
    .setFooter(
      `Requested by ${song.member.displayName}`,
      song.member.user.displayAvatarURL()
    )
  );
  queue.dispatcher = queue.connection.play(stream)
  .once('finish', next);
  async function next() {
    if (song.loop) queue.songs.unshift(song);
    else if (queue.loop) queue.songs.push(song);
    await queue.nowPlayingMsg.delete()
    .then(
      () => queue.nowPlayingMsg = null,
      () => queue.nowPlayingMsg = null
    );
    if (!queue.songs.length && queue.autoplay) {
      try {
        const id = song._info.related_videos
          .find(({id, duration}) => !queue.autoPlayHistory.includes(id) && duration < 900).id;
        const url = "https://youtu.be/" + id;
        queue.autoPlayHistory.unshift(id);
        queue.autoPlayHistory.length = 5;
        await queue.addMusic(url, { member: queue.textChannel.guild.me });
        play(queue);
        return;
      } catch(err) {
        queue.textChannel.send(
          new MessageEmbed()
          .setTitle(":x: Exception")
          .setDescription(`${err}`)
        );
      }
    }
    play(queue);
  }
}
