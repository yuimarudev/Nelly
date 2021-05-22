module.exports = async (message, args, client) => {
  switch (args[0]) {
    case "show":
      showList(message, args, client);
      break;
    case "add":
      addToList(message, args, client);
    case "del":
      deleteElement(message, args, client);
    default:
      return void await message.channel.send(`:x: 第一引数の値が無効です。`);
  }
}

function showList(m) {
  return void await m.channel.send(
    `:slight_frown: This is not supported yet.`
  );
}

function addToList(m) {
  return void await m.channel.send(
    `:slight_frown: This is not supported yet.`
  );
}

function deleteElement(m) {
  return void await m.channel.send(
    `:slight_frown: This is not supported yet.`
  );
}
