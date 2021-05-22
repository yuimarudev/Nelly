module.exports = (message, args, client) => {
	const dict = require('../commands.json');
	if (args?.length) {
		const info = dict[args[0]];
		info
			? message.channel.send(
					MessageEmbed({
						title: args[0],
						description: info['description'],
						fields: [
							{
								name: '詳細',
								value: dict['details']
							},
							{
								name: '引数',
								value: `%${args[0]} ${info["args"].map(
									content => '<' + content.join('│') + '>'
								).join(' ')}`
							}
						]
					})
			  )
			: message.channel.send('無効なコマンドです');
	} else {
	    message.channel.send(Object.keys(dict["aliases"]).join('\n'))
	}
};
