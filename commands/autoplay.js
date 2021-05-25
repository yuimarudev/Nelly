module.exports = async message => {
    const queue = queues.get(message.guild.id);
    if (!queue)
        return void await message.reply(Messages.Noqueue);
    await message.reply(Messages.AutoPlay + ((queue.autoplay = !queue.autoplay) ? "ON" : "OFF"));
}
