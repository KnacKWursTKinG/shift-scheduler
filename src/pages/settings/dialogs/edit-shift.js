import ui from "ui";

/**
 * @typedef {import("ui/src/wc").Store<import("../../../types").StoreEvents>} Store
 * @typedef {import("ui/src/wc").Lang} Lang
 * @typedef {import("ui/src/wc").FlexGrid} FlexGrid
 * @typedef {import("ui/src/wc").FlexGridItem} FlexGridItem
 * @typedef {import("ui/src/wc").Button} Button
 * @typedef {import("ui/src/wc").Label} Label
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
    #onCancel = async () => this.ui.close();

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
        this.createContentColorPicker(content);
        this.createContentUseDefaultColorCheckbox(content)
        this.createContentVisibleCheckbox(content)

        this.appendChild(content);
    } // }}}

    /**
     * @private
     * @param {FlexGrid} container 
     */
    createContentSectionName(container) { // {{{
        this.nameItem = new ui.wc.FlexGridItem();
        this.nameItem.innerHTML = `
                <ui-secondary></ui-secondary>
                <input type="text" value="${this.shift.name}">
            `;

        this.nameItem.querySelector("input").oninput =
            async (/** @type {Event & { currentTarget: HTMLInputElement }} */ev) => {
                this.shift.name = ev.currentTarget.value;
            };

        container.appendChild(this.nameItem);
    } // }}}

    /**
     * @private
     * @param {FlexGrid} container 
     */
    createContentSectionShortName(container) { // {{{
        this.shortNameItem = new ui.wc.FlexGridItem();
        this.shortNameItem.innerHTML = `
            <ui-secondary>
                ${this.#lang.ui.get("settings", "dialogEditShiftShortName")}
            </ui-secondary>
            <input
                style="color: ${this.shift.color || 'inherit'};"
                type="text"
                value="${this.shift.shortName}"
            >
        `;

        this.shortNameItem.querySelector("input").oninput =
            async (/** @type {Event & { currentTarget: HTMLInputElement }} */ev) => {
                this.shift.shortName = ev.currentTarget.value;
            };

        if (!this.shift.visible) {
            this.disableContentSection(this.shortNameItem);
        } else {
            this.enableContentSection(this.shortNameItem);
        }

        container.appendChild(this.shortNameItem);
    } // }}}

    /**
     * @private
     * @param {FlexGrid} container 
     */
    createContentColorPicker(container) { // {{{
        this.colorPickerItem = new ui.wc.FlexGridItem();
        this.colorPickerItem.innerHTML = `
            <ui-label>
                <input slot="input" style="width: 100%;" type="color" value="${this.shift.color}">
            </ui-label>
        `;

        this.colorPickerItem.querySelector("input").onchange =
            async (/**@type{Event & { currentTarget:  HTMLInputElement }}*/ev) => {
                this.updateShiftColor(ev.currentTarget.value || null)
            };

        if (!this.shift.visible) {
            this.disableContentSection(this.colorPickerItem);
        } else {
            this.enableContentSection(this.colorPickerItem);
        }

        container.appendChild(this.colorPickerItem);
    } // }}}

    /**
     * @private
     * @param {FlexGrid} container 
     */
    createContentUseDefaultColorCheckbox(container) { // {{{
        this.useDefaultColorItem = new ui.wc.FlexGridItem();
        this.useDefaultColorItem.innerHTML = `
            <ui-label ripple>
                <input slot="input" type="checkbox">
            </ui-label>
        `;

        /** @type {HTMLInputElement} */
        const input = this.useDefaultColorItem.querySelector("input");
        input.checked = !this.shift.color;
        input.onchange = async () => {
            this.updateShiftColor(null)

            if (input.checked) {
                this.disableContentSection(this.colorPickerItem);
            } else {
                this.enableContentSection(this.colorPickerItem);
            }
        };

        container.appendChild(this.useDefaultColorItem);
    } // }}}

    /**
     * @private
     * @param {FlexGrid} container 
     */
    createContentVisibleCheckbox(container) { // {{{
        this.visibleItem = new ui.wc.FlexGridItem();
        this.visibleItem.innerHTML = `
            <ui-label ripple>
                <input slot="input" type="checkbox">
            </ui-label>
        `;

        const input = this.visibleItem.querySelector("input");
        input.checked = !this.shift.visible;
        input.onchange = async () => {
            this.updateShiftColor("transparent")

            if (input.checked) {
                this.disableContentSection(this.shortNameItem);
                this.disableContentSection(this.colorPickerItem);
                this.disableContentSection(this.useDefaultColorItem);
            } else {
                this.enableContentSection(this.shortNameItem);
                this.enableContentSection(this.colorPickerItem);
                this.enableContentSection(this.useDefaultColorItem);
            }
        };

        container.appendChild(this.visibleItem);
    } // }}}

    /**
     * @private
     * @param {FlexGridItem} item
     */
    enableContentSection(item) { // {{{
        item.style.opacity = "1";
        item.style.userSelect = "auto";
        const input = item.querySelector("input");
        if (!!input) input.disabled = false;
    } // }}}

    /**
     * @private
     * @param {FlexGridItem} item
     */
    disableContentSection(item) { // {{{
        item.style.opacity = "0.25";
        item.style.userSelect = "none";
        const input = item.querySelector("input");
        if (!!input) input.disabled = true;
    } // }}}

    /**
     * @private 
     * @param {string | null} color
     */
    async updateShiftColor(color) {
        this.shift.color = color;
        this.shortNameItem.style.color = this.shift.color || "inherit";
    }

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
        this.nameItem.querySelector("ui-secondary").innerHTML =
            this.#lang.ui.get("settings", "dialogEditShiftName");

        // Short
        this.shortNameItem.querySelector("ui-secondary").innerHTML =
            this.#lang.ui.get("settings", "dialogEditShiftShortName");

        // @ts-expect-error - ui.primary is a `ui.wc.Label` thing
        this.colorPickerItem.querySelector("ui-label").ui.primary =
            this.#lang.ui.get("settings", "dialogEditShiftColorPicker");

        // @ts-expect-error - ui.primary is a `ui.wc.Label` thing
        this.useDefaultColorItem.querySelector("ui-label").ui.primary =
            this.#lang.ui.get("settings", "dialogEditShiftUseDefaultColor");

        // @ts-expect-error - ui.primary is a `ui.wc.Label` thing
        this.visibleItem.querySelector("ui-label").ui.primary =
            this.#lang.ui.get("settings", "dialogEditShiftVisibleItem");

        this.#cancelButton.innerText = this.#lang.ui.get("general", "cancelButton");
        this.#submitButton.innerText = this.#lang.ui.get("general", "submitButton");
    }
} // }}}
