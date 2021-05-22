module.export = class {
  constructor(data) {
    let details = songInfo.videoDetails;
    this.title = details.title;
    this.url = detail.video_url;
    this.thumbnail = details.thumbnails[details.thumbnails.length - 1];
    this.duration = details.lengthSeconds;
    this.author = details.author;
  }
}
