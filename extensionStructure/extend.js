const Message = require('./Message');
const TextChannel = require('./TextChannel');
const DMChannel = require('./DMChannel');
const { sendAPICallback } = require('./APIMessage');
const WebhookClient = require('./WebhookClient');
const Message = require('./Message');

Structures.extend("Message", () => Message);
Structures.extend("TextChannel", () => TextChannel);
Structures.extend("DMChannel", () => DMChannel);

client.ws.on("INTERACTION_CREATE", async interaction => {
  if (interaction.type === 3)
  client.emit('interaction', new MessageComponentInteraction(client, interaction)); 
});

class MessageComponentInteraction extends Discord.Interaction {
  constructor(client, data) {
    super(client, data);
    this.deferred = false;
    this.replied = false;
    this.webhook = new Discord.WebhookClient(this.applicationID, this.token, this.client.options);
    this.message = this.channel.messages.add(data.message);
    this.customID = data.data.custom_id;
    this.componentType = data.data.component_type;
    Object.defineProperty(this, "isMessageComponent", {value: true});
  }

    async defer(ephemeral) {
        if (this.deferred || this.replied) throw new Error('BUTTON_ALREADY_REPLIED: This button already has a reply');
        await this.client.api.interactions(this.discordID, this.token).callback.post({
            data: {
                type: 6,
                data: {
                    flags: ephemeral ? 1 << 6 : null,
                },
            },
        });
        this.deferred = true;
    }

    async think(ephemeral) {
        if (this.deferred || this.replied) throw new Error('BUTTON_ALREADY_REPLIED: This button already has a reply');
        await this.client.api.interactions(this.discordID, this.token).callback.post({
            data: {
                type: 5,
                data: {
                    flags: ephemeral ? 1 << 6 : null,
                },
            },
        });
        this.deferred = true;
    }

    get reply() {

        let _send = async (content, options = {}) => {

            if (this.deferred || this.replied) throw new Error('BUTTON_ALREADY_REPLIED: This button already has a reply');

            if (typeof (options) === 'boolean' && options === true) {
                options = { flags: 1 << 6 }
            }

            let { data: info, files } = await (content instanceof sendAPICallback ? content : sendAPICallback.create(this.client.channels.resolve(this.channel.id), content, options || {})).resolveData();

            await this.client.api.interactions(this.discordID, this.token).callback
                .post({
                    data: {
                        data: info,
                        type: options.type ? ([4, 5, 6, 7].includes(parseInt(options.type)) ? parseInt(options.type) : 4) : 4,
                    },
                    files
                });
            this.replied = true;
        }

        let _fetch = async () => {
            const raw = await this.webhook.fetchMessage('@original');
            return this.channel ? this.channel.messages.add(raw) : raw;
        }

        let _edit = async (content, options = {}) => {
            if (this.deferred === false && this.replied === false) throw new Error('BUTTON_ALREADY_REPLIED: This button has no reply');
            const raw = await this.webhook.editMessage('@original', content, options);
            return this.channel ? this.channel.messages.add(raw) : raw;
        }

        let _delete = async () => {
            if (this.deferred === false && this.replied === false) throw new Error('BUTTON_ALREADY_REPLIED: This button has no reply');
            return await this.webhook.deleteMessage('@original');
        }

        return {
            send: _send,
            fetch: _fetch,
            edit: _edit,
            delete: _delete
        }
    }
}
