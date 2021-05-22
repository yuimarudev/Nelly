const Song = require('./Song.js');

module.export = class {
  constructor(message, connection=null) {
    this.textChannel = message.channel;
    this.voiceChannel = message.member.voice.channel;
    this.connection = connection;
    this.songs = [];
    this.volume = 5;
    this.playing = false;
  }
  async addAudio(query) {
    const info = await ytdl.getInfo(query);
    queue.songs.push(new Song(info));
  }
}
