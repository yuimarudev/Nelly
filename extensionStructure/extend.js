const Message = require('./Message');
const TextChannel = require('./TextChannel');
const DMChannel = require('./DMChannel');

Structures.extend("Message", () => Message);
Structures.extend("TextChannel", () => TextChannel);
Structures.extend("DMChannel", () => DMChannel);
