module.exports = (message, args, client) => {
  const dict = require('../commands.json');
  if (args.length) {
    const info = dict.commands[args[0]];
    if (info) {
      message.channel.send({
        embed: {
          title: args[0],
          description: info.description,
          fields: [{
            name: '詳細',
            value: dict.details
          }, {
            name: '引数',
            value: `%${args[0]} ${info.args.map(
              content => '<' + content.join('│') + '>'
            ).join(' ')}`
          }]
        }
      });
    } else {
      message.channel.send('無効なコマンドです');
    }
  } else {
    message.channel.send({
      embed: {
        title: "コマンド一覧",
        description: Object.keys(dict.commands).map(v => '・' + v).join('\n')
      }
    });
  }
};
