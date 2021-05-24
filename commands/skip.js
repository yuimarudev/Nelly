module.exports = async message => {
  const queue = queues.get(message.guild.id);
  const skipReqs = queue.skipReqs;
  if (!queue)
    return void await message.reply(":x: There is no queue.");
  const now = queue.playingSong;
  if (!now)
    return void await message.reply(":x: No music is playing.");
  const next = queue.songs[0];
  if (now.loop) {
    now.loop = false;
    if (next) next.loop = true;
  }
  if (!now.member.user.bot && queue.voiceChannel.members.has(now.member.id)) {
    if (now.member.id !== message.member.id) {
      const limen = Math.ceil(queue.voiceChannel.members.size / 2);
      skipReqs.add(message.member.id);
      if (skipReqs.size >= limen) {
        skipReqs.clear();
        try {
          queue.dispatcher.emit('finish');
          await message.reply(":fast_forward: Skipped!");
        } catch { }
        return;
      }
      return void await message.reply(`Skip request (${skipReqs.size}/${limen})`);
    }
  }
  try {
    queue.dispatcher.emit('finish');
    await message.reply(":fast_forward: Skipped!");
  } catch { }
};

