const vm = require('vm');
let that = this;
module.exports = async (message, [code], client) => {
    if (!(await client.application.fetch()).owner.members.has(message.author.id)) return;
    let result;
    try {
      let Script = new vm.Script(code);
      result = Script.runIntContext(Context);
    } catch (e) {
      result = e;
    }
    if (Object.prototype.toString.call(result) === "[object Error]")
    result = Error.prototype.toString.call(result);
    else result = "```js\n" + require('util').inspect(result) + "```";
    await message.channel.send(result);
}

function Context(...args){
  return vm.createContext({
    ...global,
    ...that,
    ...args
  });
};
