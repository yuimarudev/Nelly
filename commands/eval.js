const { NodeVM } = require('vm2');

module.exports = async (message, code, client) => {
    if (!(await client.application.fetch()).owner.members.has(message.author.id)) return;
    let result;
    try {
        const vm = new NodeVM({
            sandbox: Object.defineProperty({
                message,
                client
            }, Object.getOwnPropertyDescriptors(global)),
            require: true
        });
        result = Script.runInThisContext({ timeout: 10000 });
    } catch (e) {
        result = e;
    }
    if (Object.prototype.toString.call(result) === "[object Error]")
    result = Error.prototype.toString.call(result);
    else result = "```js\n" + require('util').inspect(result) + "```";
    await message.channel.send(result);
}


