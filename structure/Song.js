module.exports = class {
  constructor(data) {
    let details = data.videoDetails;
    this.title = details.title;
    this.url = details.video_url;
    this.thumbnail = details.thumbnails[details.thumbnails.length - 1];
    this.duration = details.lengthSeconds;
    this.author = details.author;
    this._info = data;
  }
}
