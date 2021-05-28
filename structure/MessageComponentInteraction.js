module.exports = class MCI extends Discord.Interaction {
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
}
