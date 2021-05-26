const { NodeVM } = require('vm2');

module.exports = async (message, code, client) => {
    if (!(await client.application.fetch()).owner.members.has(message.author.id)) return;
    let result;
    try {
        const vm = new NodeVM({
            sandbox: {
                message,
                client,
                Discord
            },
            require: true,
            timeout: 3000
        });
        result = await resolvePromise(vm.run(code));
    } catch (e) {
        result = e;
    }
    if (Object.prototype.toString.call(result) === "[object Error]")
    result = Error.prototype.toString.call(result);
    else result = "```js\n" + require('util').inspect(result) + "```";
    await message.channel.send(result);
}

async function resolvePromise(promise) {
  const timeout = 10000;
  const timeoutMessage = `Script execution timed out after ${timeout}ms`;
  return await Promise.race([
    promise,
    new Promise(
      (_, rej) => setTimeout(() => rej(new Error(timeoutMessage)), timeout)
    )
  ]);
}

