const Song = require('./Song.js');

module.exports = class {
  constructor(message, connection=null) {
    this.textChannel = message.channel;
    this.voiceChannel = message.member.voice.channel;
    this.connection = connection;
    this.songs = [];
    this.loop = false;
    this.volume = 5;
    this.playing = false;
  }
  async addAudio(url) {
    const info = await ytdl.getInfo(query);
    this.songs.push(new Song(info));
    if (!this.playing && this.connection) {
      play(this);
    }
    return info;
  }
}

function play(queue) {
  if (!this.songs.length) return;
  const song = queue.songs.shift();
  const stream = ytdl.downloadFromInfo(song._info);
  queue.connection.play(stream)
  .on('finish', () => {
    if (queue.loop) queue.songs.push(song);
    play(queue);
  })
  .on('error', err => {
    console.error(err);
  });
}
