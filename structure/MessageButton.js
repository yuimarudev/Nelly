const { resolveString } = Discord.Util;

module.exports = class MessageButton {
    #_style = 1;
    #_label = "button";
    #_url;
    #_custom_id = "test";
    constructor({type, style, label="", custom_id=null, disabled=false, url=null} = {}) {
        if (type !== 2) throw Error("Invalid Type: This is not button type.");
        if (custom_id === null && url === null || custom_id !== null && url !== null)
        throw new Error("Invalid button: A button must has a custom_id or a url.");
        this.setStyle(style)
        .setLabel(label);
        this[url ? "setURL" : "setID"](custom_id ?? url)
        this.disabled = disabled;
    }
    get style() { return this.#_style; }
    get label() { return this.#_label; }
    get url() { return this.#_url; }
    get id() { return this.#_custom_id; }
    setStyle(style) {
        if (typeof style === "number" && 0 < style && style < 5)
            this.#_style = style;
        return this;
    }
    setLabel(label) {
        const str = resolveString(label);
        if (str) this.#_label = str;
        return this;
    }
    setDisabled(boolean = true) {
        this.disabled = boolean;
        return this;
    }
    setURL(url) {
        this.#_style = 5;
        this.#_url = resolveString(url);
        return this;
    }
    setID(id) {
        this.#_custom_id = resolveString(id);
        if (4 < this.#_style) this.#_style = 1;
        return this;
    }

    toJSON() {
        return {
            type: 2,
            style: this.#_style,
            label: this.#_label,
            disabled: Boolean(this.disabled),
            url: this.#_url,
            custom_id: this.#_custom_id
        }
    }
}
