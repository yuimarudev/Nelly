module.exports = class ActionRow {
  addButtons(...buttons) {
    if(!this.buttons) this.buttons = [];
    this.buttons.push(...buttons);
    return this;
  }
  spliceButtons(index, deleteCount, ...buttons) {
    if(!this.buttons) this.buttons = [];
    this.buttons.splice(index, deleteCount, ...buttons);
    return this;
  }
}
