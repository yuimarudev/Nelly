module.exports = class ActionRow {
  buttons = [];
  addButtons(...buttons) {
    this.buttons.push(...buttons);
    return this;
  }
  spliceButtons(index, deleteCount, ...buttons) {
    this.buttons.splice(index, deleteCount, ...buttons);
    return this;
  }
}
