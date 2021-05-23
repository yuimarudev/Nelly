const Song = require('./Song.js');

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
    await queue.textChannel.send("Queue Finished...");
    return;
  }
  queue.isPlaying = true;
  const song = queue.playingSong = queue.songs.shift();
  const stream = ytdl.downloadFromInfo(song._info);
  queue.nowPlayingMsg = await queue.textChannel.send({ embed: {
    title: "Now Playing",
    description: `[${song.title}](${song.url})\nRequested by <@${song.member.id}>`
  }});
  queue.dispatcher = queue.connection.play(stream)
  .on('finish', () => {
    if (queue.loop) queue.songs.push(song);
    queue.nowPlayingMsg.delete()
    .then(
      () => queue.nowPlayingMsg = null,
      () => queue.nowPlayingMsg = null
    );
    play(queue);
  })
  .on('error', err => {
    queue.textChannel.send({ embed: {
      title: ":x: Exception",
      description: `${err}`
    }});
    if (queue.loop) queue.songs.push(song);
    queue?.nowPlayingMsg.delete()
    .then(
      () => queue.nowPlayingMsg = null,
      () => queue.nowPlayingMsg = null
    );
    play(queue);
  });
}
