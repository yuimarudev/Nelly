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
    this.autoplay = true;
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
  const song = queue.playingSong = queue.songs.shift();
  const stream = ytdl.downloadFromInfo(song._info);
  queue.nowPlayingMsg = await queue.textChannel.send({ embed: {
    title: "Now Playing",
    description: `[${song.title}](${song.url})`,
    thumbnail: { url: song.thumbnail.url },
    footer: {
      text: `Requested by ${song.member.displayName}`,
      icon_url: song.member.user.displayAvatarURL()
    }
  }});
  queue.dispatcher = queue.connection.play(stream)
  .once('finish', next)
  .once('error', async err => {
    queue.textChannel.send({ embed: {
      title: ":x: Exception",
      description: `${err}`
    }});
    await next();
  });
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
        const url = "https://youtu.be/" + song._info.related_videos[0].id;
        await queue.addMusic(url, { member: queue.textChannel.guild.me });
      } catch { }
    }
    play(queue);
  }
}
