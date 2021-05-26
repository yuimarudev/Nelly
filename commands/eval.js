const { VM } = require('vm2');

module.exports = async (message, code, client) => {
    if (!(await client.application.fetch()).owner.members.has(message.author.id)) return;
    let result;
    try {
        const vm = new VM({
            sandbox: {
                message,
                client,
                Discord,
                require
            },
            require: true,
            timeout: 3000
        });
        result = await withTimeout(vm.run(code));
    } catch (e) {
        result = e;
    }
    if (Object.prototype.toString.call(result) === "[object Error]")
    await message.channel.send(Error.prototype.toString.call(result));
    else await message.channel.send(
        "```js\n" + require('util').inspect(result) + "```",
        {
            split: true,
            code: "js"
        }
    );
}

function withTimeout(promise) {
  const timeout = 10000;
  const timeoutMessage = `Script execution timed out after ${timeout}ms`;
  return Promise.race([
    promise,
    new Promise(
      (_, rej) => setTimeout(() => rej(new Error(timeoutMessage)), timeout)
    )
  ]);
}

