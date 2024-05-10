import ui from "ui";
import * as dialogs from "../dialogs";

/**
 * @typedef {import("ui/src/wc").Store<import("../../../types").StoreEvents>} Store
 * @typedef {import("ui/src/wc").Lang} Lang
 *
 * @typedef {import("../../../types").Shift} Shift
 */

export class ShiftAddButton extends ui.wc.Button {
    /** @type {Store} */
    #store;
    /** @type {Lang} */
    #lang;

    static register = () => customElements.define("shift-add-button", ShiftAddButton)

    /**
     * @param {Store} store
     * @param {Lang} lang
     */
    constructor(store, lang) { // {{{
        super();
        super.setAttribute("color", "primary")
        super.setAttribute("variant", "full")

        this.#store = store;
        this.#lang = lang;
    } // }}}

    connectedCallback() {
        super.connectedCallback()

        this.addEventListener("click", () => {
            /** @type {Shift} */
            const shift = {
                id: new Date().getTime(),
                name: "",
                shortName: "",
                visible: true,
                color: null,
            };
            const dialog = new dialogs.EditShiftDialog(shift, this.#store, this.#lang);
            document.body.appendChild(dialog)

            dialog.ui.open(true);
            dialog.ui.events.on("close", () => {
                document.body.removeChild(dialog);
            });

            dialog.ui.events.on("submit", (shift) => {
                console.warn(`@TODO: Add new shift:`, shift);
            })
        });

        setTimeout(() => {
            this.#store.ui.on("lang", this.onLang.bind(this), true);
        });
    }

    /** @private */
    async onLang() {
        this.innerHTML = this.#lang.ui.get("settings", "shiftsAddButton");
    }
} // }}}
