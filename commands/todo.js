const toDoList = [ ];

module.exports = async (message, args, client) => {
  switch (args.shift()) {
    case "show":
      await showList(message, args, client);
      break;
    case "add":
      await addToList(message, args, client);
    case "del":
      await deleteElement(message, args, client);
    default:
      await message.channel.send(`:x: 第一引数の値が無効です。`);
  }
}

async function showList(m) {
  await m.channel.send(
    toDoList.map(v => "・" + v).join('\n')
  );
}

async function addToList(m, args) {
  toDoList.push(args[0]);
  await m.channel.send(
    `:white_check_mark: This is not supported yet.`
  );
}

async function deleteElement(m, args) {
  let index = parseInt(args[0], 10);
  if (Number.isNaN(index))
    return void await m.channel.send(
      `An invalid argument '${args[0]}'.`
    );
  if (index < toDoList) {
    let [spliced] = toDoList.splice(index, 1);
    await m.channel.send(
      `:white_check_mark: Eliminated: ${spliced}`
    );
  } else {
    await m.channel.send(
      `Error: out of range.`
    );
  }
}
