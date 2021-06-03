import {
  MessageEmbed,
  MessageAttachment,
  Discord,
  Messages,
  stringFormat,
  queues
} from '../index.mjs';

export default (message => {
  const queue = queues.get(message.guild.id);
  if (!queue)
    return void await message.reply(Messages.NoQueue);
  const enabled = queue.autoplay = !queue.autoplay;
  await message.reply(Messages.AutoPlay + (enabled ? "ON" : "OFF"));
})
