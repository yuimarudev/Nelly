module.exports = async (message, args) => {
    let { textChannel, songs } = queues.get(message.guild.id);
    const msg = await textChannel.send('ちょっと待ってね！(   ◜ω◝ )');
    const eliminated = [];
    args.forEach(i => {
        eliminated.push(songs[i]);
        songs[i] = void 0;
    });
    for (let index; ~(index = songs.indexOf(void 0));)
      songs.splice(index, 1);
    msg.edit(`${args.length}曲削除したよ！( ◜௰◝  ）${eliminated.map(s => s.title).join('\n')}`);
}
