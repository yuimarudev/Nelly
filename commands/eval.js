const toStr = Object.prototype.toString.call;

module.exports = async (message, [code], client) => {
    const owner = await client.fetchApplication();
    if (!owner.members.has(message.user.id)) return;
    try {
      result = eval(code);
    } catch (e) {
      result = e;
    }
    if (toStr(result) === "[object Error]")
    result = Error.prototype.toString.call(result);
    else result = "```js\n" + inspect(result) + "```";
    await message.channel.send(result);
}
