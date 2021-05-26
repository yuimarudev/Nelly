const cmd = require('child_process').spawn("npm", ["i", "vm2"]);

cmd.stdout.on("data", process.stdout.write);
cmd.stderr.on("data", process.stderr.write);
cmd.on('close', code => console.log("Finished: " + code));

/*
const { NodeVM } = require('vm2');

module.exports = async (message, code, client) => {
    if (!(await client.application.fetch()).owner.members.has(message.author.id)) return;
    let result;
    try {
        const vm = new VM({
            sandbox: {
                ...global,
                message,
                client
            },
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

*/
