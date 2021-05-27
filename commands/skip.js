module.exports = async message => {
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
    const limen = Math.ceil(queue.voiceChannel.members.size / 2);
    skipReqs.add(message.member.id);
    if (skipReqs.size >= limen) {
      skipReqs.clear();
      try {
        skipTo(queue, 1);
        await message.reply(Messages.Skipped);
      } catch { }
      return;
    }
    return void await message.reply(`${Messages.SkipRequest} (${skipReqs.size}/${limen})`);
  }
  try {
    skipTo(queue, 1);
    await message.reply(Messages.Skipped);
  } catch { }
};

function skipTo({songs, dispatcher}, index) {
  if (typeof index !== "number" || index < 1) return songs;
  if (1 < index) songs.push(sings.splice(0, index - 1));
  dispatcher.destroy();
}
