module.exports = async (message, args) => {
    let { textChannel, songs } = queues.get(message.guild.id);
    if (songs.length < args.length)
        return void await message.reply(":x: 引数の数が多すぎます。");
    const msg = await message.channel.send('ちょっと待ってね！(   ◜ω◝ )');
    const eliminated = [];
    [...new Set(args)].forEach(i => {
        i -= 1;
        eliminated.push(songs[i]);
        songs[i] = void 0;
    });
    for (let index; ~(index = songs.indexOf(void 0));)
      songs.splice(index, 1);
    msg.edit(`${args.length}曲削除したよ！( ◜௰◝  ）${eliminated.map(s => '\n・' + s.title)}`);
}
