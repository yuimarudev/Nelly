module.exports = async (message, args) => {
    const { textChannel, songs } = queues.get(message.guild.id);
    const msg = await textChannel.send('ちょっと待ってね！(   ◜ω◝ )');
    args.forEach((i, index) => {
      songs.splice(i - 1, 1);
      msg.edit(`${index + 1}曲削除したよ！( ◜௰◝  ）`);
    });
}
