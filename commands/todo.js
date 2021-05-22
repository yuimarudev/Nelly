const toDoList = [ ];
const deleted = [ ];
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
    case "res":
      await restoreElement(message, args, client);
      break;
    default:
      await message.channel.send(`:x: 第一引数の値が無効です。`);
      break;
  }
}

async function showList(m) {
  await m.channel.send(
    toDoList.map(v => "・" + v).join('\n') || "List is empty."
  );
}

async function addToList(m, args) {
  toDoList.push(args[0]);
  logTheList();
  await m.channel.send(
    `:white_check_mark: Added!`
  );
}

async function restoreElement(m, args) {
  let len = 1;
  if (0 < args.length) {
    len = parseInt(args[0], 10);
    if (Number.isNaN(len) || len < 1)
      return void await m.channel.send(
        `An invalid argument '${args[0]}'.`
      );
  }
  if (len < deleted.length) {
    return void await m.channel.send(
      `Error: out of range.`
    );
  }
  for(let i = 0; i < len && deleted.length; i++) {
    toDoList.push(deleted.pop());
  }
  logTheList();
  await m.channel.send(
    `:white_check_mark: Restored!`
  );
}

async function deleteElement(m, args) {
  let index = parseInt(args[0], 10);
  if (Number.isNaN(index))
    return void await m.channel.send(
      `An invalid argument '${args[0]}'.`
    );
  if (index < toDoList.length) {
    let [spliced] = toDoList.splice(index, 1);
    deleted.push(spliced);
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
