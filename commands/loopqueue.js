module.exports = async message => {
    const q = queues.get(message.guild.id);
    if (!q) {
      return void await message.reply(Messages.NoQueue);
    }
    const enabled = (q.loop = !q.loop);
    await message.reply(Messages.QueueLoop + (enabled ? "ON" : "OFF"));
}
