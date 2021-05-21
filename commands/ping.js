module.exports = async(message) => {
  return void await message.channel.send(`pong!🏓 ${message.client.ws.ping}`);
};
