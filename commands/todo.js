const toDoList = [ ];
const logPath = "./todo.log";

if (fs.existsSync(logPath)) {
  const addend = JSON.parse(
    fs.readFileSync(logPath, "utf-8")
  );
  toDoList.push(...addend);
}
const logTheList = () => {
  fs.writeFileSync(logPath, JSON.stringify(toDoList));
};

module.exports = async (message, args, client) => {
  switch (args.shift()) {
    case "show":
      await showList(message, args, client);
      break;
    case "add":
      await addToList(message, args, client);
      break;
    case "del":
      await deleteElement(message, args, client);
      break;
    default:
      await message.channel.send(`:x: 第一引数の値が無効です。`);
      break;
  }
}

async function showList(m) {
  await m.channel.send(
    toDoList.map(v => "・" + v).join('\n')
  );
}

async function addToList(m, args) {
  toDoList.push(args[0]);
  logTheList();
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
    logTheList();
    await m.channel.send(
      `:white_check_mark: Eliminated: ${spliced}`
    );
  } else {
    await m.channel.send(
      `Error: out of range.`
    );
  }
}
