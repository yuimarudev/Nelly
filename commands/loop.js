module.exports = message => {
    const q = queues.get(message.guild.id);
    const enabled = (q.loop = !q.loop);
    await message.reply(":repeat: Queue Loop " + (enabled ? "ON" : "OFF"));
}
