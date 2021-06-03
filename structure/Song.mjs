import {
  MessageEmbed,
  MessageAttachment,
  Discord,
  Messages,
  stringFormat,
  queues
} from '../index.mjs';

export default (class {
  constructor(data, message) {
    let details = data.videoDetails;
    this.title = details.title;
    this.url = details.video_url;
    this.thumbnail = details.thumbnails[details.thumbnails.length - 1];
    this.duration = details.lengthSeconds;
    this.author = details.author;
    this.member = message.member;
    this.loop = false;
    this._info = data;
  }
})
