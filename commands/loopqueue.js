module.exports = async message => {
    const q = queues.get(message.guild.id);
    if (!q) {
      return void await message.reply(":x: The queue is void.");
    }
    const enabled = (q.loop = !q.loop);
    await message.reply(":repeat: Queue Loop " + (enabled ? "ON" : "OFF"));
}
