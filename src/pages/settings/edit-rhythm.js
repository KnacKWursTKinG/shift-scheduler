import { EditRhythmDialog } from "./dialogs"

/**
 * @typedef {import("ui/src/wc").Store<import("../../types").StoreEvents>} Store
 * @typedef {import("ui/src/wc").Lang} Lang
 * @typedef {import("ui/src/wc").Primary} Primary
 * @typedef {import("ui/src/wc").Button} Button
 */

const innerHTML = `
<ui-label>
    <ui-primary slot="primary"></ui-primary>

    <ui-button slot="input" color="primary" variant="full"></ui-button>
</ui-label>
`;

export class EditRhythm extends HTMLElement {
    /** @type {Store} */
    #store;
    /** @type {Lang} */
    #lang;
    /** @type {Primary} */
    #primary;
    /** @type {Button} */
    #button
    /** @type {EditRhythmDialog} */
    #dialog

    static register = () => customElements.define("settings-edit-rhythm", EditRhythm)

    /**
     * @param {Store} store
     * @param {Lang} lang
     */
    constructor(store, lang) { // {{{
        super();
        this.innerHTML = innerHTML;

        /** @type {(() => void)[]} */
        this.cleanup = [];

        this.#store = store;
        this.#lang = lang;

        this.#primary = this.querySelector("ui-primary");

        this.#button = this.querySelector("ui-button")
        this.#button.onclick = async () => {
            document.body.appendChild(this.#dialog)
            this.#dialog.ui.open(true)
        }

        this.#dialog = new EditRhythmDialog(this.#store, this.#lang)
        this.#dialog.ui.events.addListener("close", async () => {
            document.body.removeChild(this.#dialog)
        })
    } // }}}

    connectedCallback() { // {{{
        setTimeout(() => {
            this.cleanup.push(
                this.#store.ui.on("lang", async () => {
                    this.#primary.innerHTML = this.#lang.ui.get("settings", "shiftsEditRhythmPrimary");
                    this.#button.innerHTML = this.#lang.ui.get("settings", "shiftsEditRhythmButton")
                }, true),
            );
        });
    } // }}}

    disconnectedCallback() { // {{{
        this.cleanup.forEach((fn) => fn());
        this.cleanup = [];
    } // }}}
}
