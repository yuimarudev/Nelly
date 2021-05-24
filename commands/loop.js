module.exports = async message => {
    const q = queues.get(message.guild.id);
    if (!q) {
      return void await message.reply(":x: There is no queue.");
    }
    if (!q.playingSong) {
      return void await message.reply(":x: No music is playing.");
    }
    const enabled = (q.playingSong.loop = ! q.playingSong.loop);
    await message.reply(":repeat_one: Music Loop " + (enabled ? "ON" : "OFF"));
}
