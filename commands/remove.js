module.exports = async (message, args) => {
    let { voiceChannel, textChannel, songs } = queues.get(message.guild.id);
    if (songs.length < args.length)
        return void await message.reply(Messages.ArgumentLengthOver);
    const msg = await message.channel.send(Messages.PleaseWait);
    const eliminated = [];
    [...new Set(args)].forEach(i => {
        --i;
        if (
           !voiceChannel.members.has(songs[i].member.id) ||
           songs[i].member.id === message.member.id
        ) {
            eliminated.push(songs[i]);
            songs[i] = void 0;
        }
    });
    for (let index; ~(index = songs.indexOf(void 0));)
        songs.splice(index, 1);
    msg.edit(`Removed ${eliminated.length} songs! ( ◜௰◝  ）${eliminated.map(s => '\n・' + s.title)}`);
}
