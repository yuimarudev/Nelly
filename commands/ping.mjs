import {
  MessageEmbed,
  MessageAttachment,
  Discord,
  Messages,
  stringFormat,
  queues
} from '../index.mjs';

export default ((message, _, client) => {
  return void await message.channel.send(`Pong!🏓 ${client.ws.ping}ms`);
});
