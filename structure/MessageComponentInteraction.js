module.exports = class extends Discord.Interaction {
  constructor(client, data) {
    super(client, data);
    this.message = this.channel.messages.add(data.message);
    this.customID = data.data.custom_id;
    this.componentType = data.data.component_type;
    Object.defineProperty(this, "isMessageComponent", {value: true});

    this._data = data;
    this.deferred = false;
    this.replied = false;
    this.webhook = new Discord.WebhookClient(this.applicationID, this.token, this.client.options);
  }
}

for (const key of ["defer", "deleteReply", "editReply", "fetchReply", "followUp", "reply"])
module.exports.prototype[key] = Discord.CommandInteraction.prototype[key];
