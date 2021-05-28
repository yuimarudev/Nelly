const { DataResolver, Util, MessageFlags, MessageAttachment, MessageEmbed} = Discord;
const MessageButton = require('./structure/MessageButton');
module.exports = MessageButton;

Discord.APIMessage.transformOptions = function(content, options, extra = {}, isWebhook = false) {
    if (!options && typeof content === 'object' && !Array.isArray(content)) {
      options = content;
      content = undefined;
    }

    if (!options) {
      options = {};
    } else if (options instanceof MessageEmbed) {
      return isWebhook ? { content, embeds: [options], ...extra } : { content, embed: options, ...extra };
    } else if (options instanceof MessageAttachment) {
      return { content, files: [options], ...extra };
    } else if (options instanceof MessageButton) {
      return { content, components: [{ type: 1, components: [options] }], ...extra };
    }

    if (Array.isArray(options)) {
      const [embeds, files, buttons] = this.partitionMessageAdditions(options);
      return isWebhook ? { content, embeds, files, components: [{ type: 1, components: buttons }], ...extra } : { content, embed: embeds[0], files, components: [{ type: 1, components: buttons }], ...extra };
    } else if (Array.isArray(content)) {
      const [embeds, files, buttons] = this.partitionMessageAdditions(content);
      if (embeds.length || files.length || buttons.length) {
        return isWebhook ? { embeds, files, components: [{ type: 1, components: buttons }], ...extra } : { embed: embeds[0], files, components: [{ type: 1, components: buttons }], ...extra };
      }
    }

    return { content, ...options, ...extra };
  }


Discord.APIMessage.partitionMessageAdditions = function(items) {
    const embeds = [];
    const files = [];
    const buttons = [];
    for (const item of items) {
      if (item instanceof MessageEmbed) {
        embeds.push(item);
      } else if (item instanceof MessageAttachment) {
        files.push(item);
      } else if (item instanceof MessageButton) {
        buttons.push(item);
      }
    }

    return [embeds, files, buttons];
  }


Discord.APIMessage.prototype.resolveData = function() {
    if (this.data) return this;

    const content = this.makeContent();
    const tts = Boolean(this.options.tts);

    let nonce;
    if (typeof this.options.nonce !== 'undefined') {
      nonce = this.options.nonce;
      // eslint-disable-next-line max-len
      if (typeof nonce === 'number' ? !Number.isInteger(nonce) : typeof nonce !== 'string') {
        throw new RangeError('MESSAGE_NONCE_TYPE');
      }
    }

    const embedLikes = [];
    if (this.isInteraction || this.isWebhook) {
      if (this.options.embeds) {
        embedLikes.push(...this.options.embeds);
      }
    } else if (this.options.embed) {
      embedLikes.push(this.options.embed);
    }
    const embeds = embedLikes.map(e => new MessageEmbed(e).toJSON());

    let username;
    let avatarURL;
    if (this.isWebhook) {
      username = this.options.username || this.target.name;
      if (this.options.avatarURL) avatarURL = this.options.avatarURL;
    }

    let flags;
    if (this.isMessage) {
      // eslint-disable-next-line eqeqeq
      flags = this.options.flags != null ? new MessageFlags(this.options.flags).bitfield : this.target.flags.bitfield;
    } else if (this.isInteraction && this.options.ephemeral) {
      flags = MessageFlags.FLAGS.EPHEMERAL;
    }

    let allowedMentions =
      typeof this.options.allowedMentions === 'undefined'
        ? this.target.client.options.allowedMentions
        : this.options.allowedMentions;

    if (allowedMentions) {
      allowedMentions = Util.cloneObject(allowedMentions);
      allowedMentions.replied_user = allowedMentions.repliedUser;
      delete allowedMentions.repliedUser;
    }

    let message_reference;
    if (typeof this.options.reply === 'object') {
      const message_id = this.isMessage
        ? this.target.channel.messages.resolveID(this.options.reply.messageReference)
        : this.target.messages.resolveID(this.options.reply.messageReference);
      if (message_id) {
        message_reference = {
          message_id,
          fail_if_not_exists: this.options.reply.failIfNotExists ?? true,
        };
      }
    }

    this.data = {
      components: this.options.components,
      content,
      tts,
      nonce,
      embed: this.options.embed === null ? null : embeds[0],
      embeds,
      username,
      avatar_url: avatarURL,
      allowed_mentions:
        typeof content === 'undefined' && typeof message_reference === 'undefined' ? undefined : allowedMentions,
      flags,
      message_reference,
      attachments: this.options.attachments,
    };
    return this;
  }
