import {
  MessageEmbed,
  MessageAttachment,
  Discord,
  Messages,
  stringFormat
} from '../index.mjs';

import Song from './Song.mjs';
import ytdl from 'ytdl-core';

export default class {
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
  
  addMusic(url, message) {
    const info = await ytdl.getInfo(url);
    const song = new Song(info, message);
    this.songs.push(song);
    if (!this.isPlaying && this.connection) play(this);
    return song;
  }
  
}

function play(queue) {
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
  .once('error', err => {
    queue.textChannel.send(
      new MessageEmbed()
      .setTitle(":x: Exception")
      .setDescription(`${err}`)
    );
    next();
  });
  queue.autoPlayHistory.unshift(song._info.videoDetails.videoId);
  queue.autoPlayHistory.length = 10;
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
  function next() {
    if (song.loop) queue.songs.unshift(song);
    else if (queue.loop) queue.songs.push(song);
    if (queue.nowPlayingMsg) await queue.nowPlayingMsg.delete()
    .then(
      () => queue.nowPlayingMsg = null,
      () => queue.nowPlayingMsg = null
    );
    if (!queue.songs.length && queue.autoplay) {
      try {
        const id = song._info.related_videos
          .find(({id, length_seconds}) => !queue.autoPlayHistory.includes(id) && length_seconds < 900).id;
        const url = "https://youtu.be/" + id;
        queue.autoPlayHistory.unshift(id);
        queue.autoPlayHistory.length = 10;
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
