const {
  APIMessage,
  Base,
  ClientApplication,
  Collection,
  DataResolver,
  MessageFlags,
  MessageAttachment,
  MessageEmbed,
  MessageMentions: Mentions,
  Permissions,
  ReactionCollector,
  ReactionManager,
  SnowflakeUtil,
  Util
} = Discord;
const MessageButton = require('./structure/MessageButton');
const Embed = MessageEmbed;
const { MessageTypes } = Discord.Constants;


module.exports = MessageButton;

Discord.Message.prototype._patch = function(data) {
    this.id = data.id;

    if ('type' in data) {
      this.type = MessageTypes[data.type];
      this.system = data.type !== 0;
    } else if (typeof this.type !== 'string') {
      this.system = null;
      this.type = null;
    }

    if ('content' in data) {
      this.content = data.content;
    } else if (typeof this.content !== 'string') {
      this.content = null;
    }

    if ('author' in data) {
      this.author = this.client.users.add(data.author, !data.webhook_id);
    } else if (!this.author) {
      this.author = null;
    }

    if ('pinned' in data) {
      this.pinned = Boolean(data.pinned);
    } else if (typeof this.pinned !== 'boolean') {
      this.pinned = null;
    }

    if ('tts' in data) {
      this.tts = data.tts;
    } else if (typeof this.tts !== 'boolean') {
      this.tts = null;
    }

    this.nonce = 'nonce' in data ? data.nonce : null;

    this.embeds = (data.embeds || []).map(e => new Embed(e, true));

    this.attachments = new Collection();
    if (data.attachments) {
      for (const attachment of data.attachments) {
        this.attachments.set(attachment.id, new MessageAttachment(attachment.url, attachment.filename, attachment));
      }
    }

    this.createdTimestamp = SnowflakeUtil.deconstruct(this.id).timestamp;

    this.editedTimestamp = 'edited_timestamp' in data ? new Date(data.edited_timestamp).getTime() : null;

    this.reactions = new ReactionManager(this);
    if (data.reactions && data.reactions.length > 0) {
      for (const reaction of data.reactions) {
        this.reactions.add(reaction);
      }
    }

    this.mentions = new Mentions(this, data.mentions, data.mention_roles, data.mention_everyone, data.mention_channels);

    this.webhookID = data.webhook_id || null;

    this.application = data.application ? new ClientApplication(this.client, data.application) : null;

    this.activity = data.activity
      ? {
          partyID: data.activity.party_id,
          type: data.activity.type,
        }
      : null;

    this._edits = [];

    if (this.member && data.member) {
      this.member._patch(data.member);
    } else if (data.member && this.guild && this.author) {
      this.guild.members.add(Object.assign(data.member, { user: this.author }));
    }

    this.flags = new MessageFlags(data.flags).freeze();

    this.reference = data.message_reference
      ? {
          channelID: data.message_reference.channel_id,
          guildID: data.message_reference.guild_id,
          messageID: data.message_reference.message_id,
        }
      : null;
  };

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
