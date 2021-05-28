const { resolveString } = Discord.Util;

module.exports = class MessageButton {
    style = 1;
    label = "button";
    setStyle(style) {
        this.style = style;
        return this;
    }
    setLabel(label) {
        this.label = resolveString(label);
        return this;
    }
    setDisabled(boolean = true) {
        this.disabled = Boolean(boolean);
        return this;
    }
    setURL(url) {
        this.url = this.style === 5 ? resolveString(url) : null;
        return this;
    }

    setID(id) {
        this.custom_id = this.style === 5 ? null : resolveString(id);
        return this;
    }

    toJSON() {
        return {
            type: 2,
            style: this.style,
            label: this.label,
            disabled: this.disabled,
            url: this.url,
            custom_id: this.custom_id
        }
    }
}
