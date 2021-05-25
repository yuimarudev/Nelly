module.exports = async message => {
    const queue = queues.get(message.guild.id);
    if (!queue)
        return void await message.reply(Messages.Noqueue);
    const enabled = queue.autoplay = !queue.autoplay;
    await message.reply(Messages.AutoPlay + (enabled ? "ON" : "OFF"));
}
