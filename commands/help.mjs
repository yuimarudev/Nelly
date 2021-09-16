import {
  MessageEmbed,
  MessageAttachment,
  Discord,
  Messages,
  stringFormat,
  queues
} from '../global.mjs';
import dict from '../commands.js';

export default ((message, args) => {
  if (args.length) {
    const info = dict.commands[args[0]];
    if (info) {
      message.channel.send(
        embeds: [ new MessageEmbed()
        .setTitle(args[0])
        .setDescription(info.description)
        .addField(Messages.Details, dict.details)
        .addField(
          Messages.Arguments,
          `%${args[0]} ${info.args.map(
            content => '<' + content.join('│') + '>'
          ).join(' ')}`
        ) ]
      );
    } else {
      message.channel.send(Messages.InvalidCommandMessage);
    }
  } else {
    message.channel.send(
      embeds: [ new MessageEmbed()
      .setTitle(Messages.CommandList)
      .setDescription(
        Object.keys(dict.commands)
        .sort()
        .map(v => '・' + v)
        .join('\n')
      ) ]
    );
  }
})
