const InteractionResponseTypes = {
  1: 'PONG',
  4: 'CHANNEL_MESSAGE_WITH_SOURCE',
  5: 'DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE',
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5
};

const { APIMessage, MessageFlags } = Discord;

module.exports = class extends Discord.Interaction {
  constructor(client, data) {
    super(client, data);
    this.deferred = false;
    this.replied = false;
    this.webhook = new WebhookClient(this.applicationID, this.token, this.client.options);
    this.message = this.channel.messages.add(data.message);
    this.customID = data.data.custom_id;
    this.componentType = data.data.component_type;
    this._data = data;
    this.isMessageComponent = true;
  }

  async defer({ ephemeral } = {}) {
    if (this.deferred || this.replied) throw new Error('INTERACTION_ALREADY_REPLIED');
    await this.client.api.interactions(this.id, this.token).callback.post({
      data: {
        type: InteractionResponseTypes.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: ephemeral ? MessageFlags.FLAGS.EPHEMERAL : undefined,
        },
      },
    });
    this.deferred = true;
  }

  async reply(content, options) {
    if (this.deferred || this.replied) throw new Error('INTERACTION_ALREADY_REPLIED');
    const apiMessage = content instanceof APIMessage ? content : APIMessage.create(this, content, options);
    const { data, files } = await apiMessage.resolveData().resolveFiles();

    await this.client.api.interactions(this.id, this.token).callback.post({
      data: {
        type: InteractionResponseTypes.CHANNEL_MESSAGE_WITH_SOURCE,
        data,
      },
      files,
    });
    this.replied = true;
  }

  async fetchReply() {
    const raw = await this.webhook.fetchMessage('@original');
    return this.channel?.messages.add(raw) ?? raw;
  }

  async editReply(content, options) {
    const raw = await this.webhook.editMessage('@original', content, options);
    return this.channel?.messages.add(raw) ?? raw;
  }

  async deleteReply() {
    await this.webhook.deleteMessage('@original');
  }

  async followUp(content, options) {
    const apiMessage = content instanceof APIMessage ? content : APIMessage.create(this, content, options);
    const { data, files } = await apiMessage.resolveData().resolveFiles();

    const raw = await this.client.api.webhooks(this.applicationID, this.token).post({
      data,
      files,
    });

    return this.channel?.messages.add(raw) ?? raw;
  }
}
