import {
  MessageEmbed,
  MessageAttachment,
  Discord,
  Messages,
  stringFormat,
  queues
} from '../global.mjs';

export default (async(message, _, client) => {
  return void await message.channel.send(`Pong!!🏓 ${client.ws.ping}ms`);
});
