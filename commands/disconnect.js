module.exports = message => {
  const cnct = queues.get(message.guild.id).connection;
  if (cnct) cnct.disconnect();
};
