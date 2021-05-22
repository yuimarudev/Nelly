module.exports = message => {
    const q = queues.get(message.guild.id);
    q.loop = !q.loop
}
