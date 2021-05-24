module.exports = (message, args, client) => {
  const dict = require('../commands.json');
  if (args.length) {
    const info = dict.commands[args[0]];
    if (info) {
      message.channel.send(
        new MessageEmbed()
        .setTitle(args[0])
        .setDescription(info.description)
        .addField(Messages.Details, dict.details)
        .addField(
          Messages.Arguments,
          `%${args[0]} ${info.args.map(
            content => '<' + content.join('│') + '>'
          ).join(' ')}`
        )
      );
    } else {
      message.channel.send(Messages.InvalidCommandMessage);
    }
  } else {
    message.channel.send(
      new MessageEmbed()
      .setTitle("コマンド一覧")
      .setDescription(
        Object.keys(dict.commands)
        .sort()
        .map(v => '・' + v)
        .join('\n')
      )
    );
  }
};
