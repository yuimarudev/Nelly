import {
  MessageEmbed,
  MessageAttachment,
  Discord,
  Messages,
  stringFormat,
  queues
} from '../index.mjs';

export default (message => {
  const queue = queues.get(message.guild.id);
  const skipReqs = queue.skipReqs;
  if (!queue)
    return void await message.reply(Messages.NoQueue);
  const now = queue.playingSong;
  if (!now)
    return void await message.reply(Messages.NoMusicPlaying);
  const next = queue.songs[0];
  if (now.loop) {
    now.loop = false;
    if (next) next.loop = true;
  }
  if (
    !now.member.user.bot &&
    queue.voiceChannel.members.has(now.member.id) &&
    now.member.id !== message.member.id
  ) {
    if (skipReqs.has(message.member.id)) {
      return void await message.reply(":x: You're voted!");
    }
    const limen = Math.ceil(queue.voiceChannel.members.filter(m => !m.user.bot).size / 2);
    skipReqs.add(message.member.id);
    if (skipReqs.size >= limen) {
      skipReqs.clear();
      try {
        skipTo(queue, 1);
        await message.reply(Messages.Skipped);
      } catch {
        void 0;
      }
      return;
    }
    return void await message.channel.send(`${Messages.SkipRequest} (${skipReqs.size}/${limen})`);
  }
  try {
    skipTo(queue, 1);
    await message.reply(Messages.Skipped);
  } catch {
    void 0;
  }
})

function skipTo({songs, dispatcher}, index) {
  if (typeof index !== "number" || index < 1) return songs;
  if (1 < index) songs.push(songs.splice(0, index - 1));
  dispatcher.destroy();
  dispatcher.emit("finish");
}
