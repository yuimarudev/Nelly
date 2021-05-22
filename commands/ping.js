module.exports = async (message, _, client) => {
  return void await message.channel.send(`pong!🏓 ${client.ws.ping}ms`);
};
