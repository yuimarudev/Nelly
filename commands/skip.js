module.exports = async message => {
  const queue = queues.get(message.guild.id);
  try {
    queue.dispatcher.destroy();
    await message.reply(":fast_forward: Skipped!");
  } catch { }
};
