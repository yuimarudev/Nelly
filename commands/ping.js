module.exports = async (message, _, client) => {
  return void await message.channel.send(`Pong!🏓 ${client.ws.ping}ms`);
};
