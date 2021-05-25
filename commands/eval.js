module.exports = async (message, [code], client) => {
    if (!client.application.owner.members.has(message.user.id)) return;
    let result;
    try {
      result = eval(code);
    } catch (e) {
      result = e;
    }
    if (Object.prototype.toString.call(result) === "[object Error]")
    result = Error.prototype.toString.call(result);
    else result = "```js\n" + require('util').inspect(result) + "```";
    await message.channel.send(result);
}
