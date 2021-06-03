import {
  MessageEmbed,
  MessageAttachment,
  Discord,
  Messages,
  stringFormat,
  queues
} from '../global.mjs';

export default (message => {
    const q = queues.get(message.guild.id);
    if (!q) {
      return void await message.reply(Messages.NoQueue);
    }
    if (!q.playingSong) {
      return void await message.reply(Messages.NoMusicPlaying);
    }
    const enabled = (q.playingSong.loop = ! q.playingSong.loop);
    await message.reply(Messages.MusicLoop + (enabled ? "ON" : "OFF"));
})
