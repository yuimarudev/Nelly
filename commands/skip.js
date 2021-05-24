module.exports = async message => {
  const queue = queues.get(message.guild.id);
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
  if (queue.voiceChannel.members.has(now.member.id)) {
    if (now.member.id !== message.member.id)
      return void await message.reply(":x: You don't have permission to skip.");
  }
  try {
    queue.dispatcher.emit('finish');
    await message.reply(":fast_forward: Skipped!");
  } catch { }
};

