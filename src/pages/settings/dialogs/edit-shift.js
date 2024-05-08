import ui from "ui";

/**
 * @typedef {import("ui/src/wc").Store<import("../../../types").StoreEvents>} Store
 * @typedef {import("ui/src/wc").Lang} Lang
 * @typedef {import("ui/src/wc").FlexGrid} FlexGrid
 * @typedef {import("ui/src/wc").Button} Button
 *
 * @typedef {import("../../../types").Shift} Shift
 */

export class EditShiftDialog extends ui.wc.Dialog {
    /** @type {Store} */
    #store;
    /** @type {Lang} */
    #lang;

    /** @type {Button} */
    #cancelButton;
    #onCancel = () => this.ui.close();

    /** @type {Button} */
    #submitButton;
    #onSubmit = () => {
        this.#store.ui.update("settings", (settings) => {
            return {
                ...settings,
                shifts: settings.shifts.map(shift => {
                    if (shift.id === this.shift.id) {
                        return this.shift;
                    }

                    return shift;
                }),
            };
        });

        this.ui.close();
    };

    static register = () => customElements.define("edit-shift-dialog", EditShiftDialog);

    /**
     * @param {Shift} shift
     * @param {Store} store
     * @param {Lang} lang
     */
    constructor(shift, store, lang) { // {{{
        super();

        this.#store = store;
        this.#lang = lang
        /** @type {Shift} */
        this.shift = { ...shift }

        this.createContent();
        this.createActionButtons();

        this.cleanup = []
    } // }}}

    connectedCallback() { // {{{
        super.connectedCallback();

        setTimeout(() => {
            this.#store.ui.on("lang", this.onLang.bind(this), true);
        });
    } // }}}

    disconnectedCallback() { // {{{
        super.disconnectedCallback();
        this.cleanup.forEach(fn => fn());
        this.cleanup = [];
    } // }}}

    /** @private */
    createContent() { // {{{
        const content = new ui.wc.FlexGrid();
        content.setAttribute("gap", "0.5rem");
        this.createContentSectionName(content)
        this.createContentSectionShortName(content)
        // TODO: color picker
        // TODO: use default color (this sets color to "inherit")
        // TODO: visible checkbox
        this.appendChild(content);
    } // }}}

    /**
     * @private
     * @param {FlexGrid} container 
     */
    createContentSectionName(container) { // {{{
        // Name
        let item = new ui.wc.FlexGridItem();

        item.innerHTML = `
                <ui-secondary></ui-secondary>
                <input type="text" value="${this.shift.name}">
            `;

        item.querySelector("input").oninput = (/** @type {Event & { currentTarget: HTMLInputElement }} */ev) => {
            this.shift.name = ev.currentTarget.value;
        };

        container.appendChild(item);
    } // }}}

    /**
     * @private
     * @param {FlexGrid} container 
     */
    createContentSectionShortName(container) { // {{{
        const item = new ui.wc.FlexGridItem();

        item.innerHTML = `
                <ui-secondary></ui-secondary>
                <input
                    style="color: ${this.shift.color || 'inherit'};"
                    type="text"
                    value="${this.shift.shortName}"
                >
            `;

        item.querySelector("input").oninput = (/** @type {Event & { currentTarget: HTMLInputElement }} */ev) => {
            this.shift.shortName = ev.currentTarget.value;
        };

        container.appendChild(item);
    } // }}}

    /** @private */
    createActionButtons() { // {{{
        // Cancel Button
        let item = new ui.wc.FlexGridItem()
        item.slot = "actions"
        item.setAttribute("flex", "0")
        item.innerHTML = `<ui-button color="secondary" variant="full"></ui-button>`
        this.#cancelButton = item.querySelector("ui-button")
        this.#cancelButton.onclick = this.#onCancel;
        this.appendChild(item)

        // Submit Button
        item = new ui.wc.FlexGridItem()
        item.slot = "actions"
        item.setAttribute("flex", "0")
        item.innerHTML = `<ui-button color="primary" variant="full"></ui-button>`
        this.#submitButton = item.querySelector("ui-button")
        this.#submitButton.onclick = this.#onSubmit;
        this.appendChild(item)
    } // }}}

    /** @private */
    async onLang() { // {{{
        this.ui.title = this.#lang.ui.get("settings", "dialogEditShiftTitle");

        // Name
        this.querySelector("ui-flex-grid-item:nth-child(1) ui-secondary").innerHTML =
            this.#lang.ui.get("settings", "dialogEditShiftName");

        // Short
        this.querySelector("ui-flex-grid-item:nth-child(2) ui-secondary").innerHTML =
            this.#lang.ui.get("settings", "dialogEditShiftShortName");

        this.#cancelButton.innerText = this.#lang.ui.get("general", "cancelButton")
        this.#submitButton.innerText = this.#lang.ui.get("general", "submitButton")
    } // }}}
}
