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
    this.dispatcher = null;
  }
  async addMusic(url, message) {
    const info = await ytdl.getInfo(url);
    const song = new Song(info, message);
    this.songs.push(song);
    if (!this.playing && this.connection) play(this);
    return song;
  }
}

async function play(queue) {
  if (!queue.songs.length) {
    queue.playing = false;
    return;
  }
  queue.playing = true;
  const song = queue.songs.shift();
  const stream = ytdl.downloadFromInfo(song._info);
  console.log("play!");
  const sentMsg = await queue.textChannel.send({ embed: {
    title: "Now Playing",
    description: `[${song.title}](${song.url})\nRequested by <@${song.member.id}>`
  }});
  queue.dispatcher = queue.connection.play(stream)
  .on('finish', () => {
    if (queue.loop) queue.songs.push(song);
    sentMsg.delete().catch(console.log);
    play(queue);
  })
  .on('error', err => {
    console.error(err);
  });
}
