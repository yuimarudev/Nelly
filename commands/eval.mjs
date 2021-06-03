import { VM } from 'vm2';

export default (message, code, client) => {
    if (!(await client.application.fetch()).owner.members.has(message.author.id)) return;
    let result;
    try {
        const sandbox = { };
        for (const key in global)
        if ("global" !== key)
        sandbox[key] = global[key];
        Object.assign(sandbox, {
            message,
            client,
            require,
            process
        });
        const vm = new VM({
            sandbox,
            require: true,
            timeout: 1000
        });
        result = await withTimeout(vm.run(code));
    } catch (e) {
        result = e;
    }
    if (result === void 0) return;
    if (Object.prototype.toString.call(result) === "[object Error]")
    await message.channel.send(Error.prototype.toString.call(result));
    else await message.channel.send(
        (await import('util')).inspect(result),
        { split: true, code: "js" }
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

