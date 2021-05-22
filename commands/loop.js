module.exports = message => {
    const q = queue.get(message.guild.id);
    q.loop = !q.loop
}
