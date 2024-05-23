import ui from "ui";

/**
 * @typedef {import("../../types").StoreEvents} StoreEvents
 *
 * @typedef {import("ui/src/wc").Store<StoreEvents>} Store
 * @typedef {import("ui/src/wc").Lang} Lang
 * @typedef {import("ui/src/wc").Button} Button
 */

const t = document.createElement("template");
t.innerHTML = `
    <ui-flex-grid
        style="padding-top: var(--ui-app-bar-height);"
        gap="0.25rem"
    >
        <ui-flex-grid-row style="align-items: center;" gap="0.25rem">
            <ui-flex-grid-item class="picker"></ui-flex-grid-item>

            <ui-flex-grid-item class="download"></ui-flex-grid-item>
        </ui-flex-grid-row>
    </ui-flex-grid>
`;

export class PDFPage extends ui.wc.StackLayoutPage {
    /** @type {Store} */
    #store
    /** @type {Lang} */
    #lang

    /** @type {Button} */
    #downloadButton;

    /** @type {HTMLInputElement} */
    #year;

    static register = () => {
        customElements.define("pdf-page", PDFPage);
    };

    constructor() {
        super();
        this.appendChild(t.content.cloneNode(true));

        /** @type {Store} */
        this.#store = document.querySelector("ui-store");
        /** @type {Lang} */
        this.#lang = document.querySelector("ui-lang");

        this.cleanup = [];

        this.createPicker();
        this.createDownload();
    }

    connectedCallback() {
        setTimeout(() => {
            this.#store.ui.on("lang", this.onLang.bind(this), true);
        });
    }

    disconnectedCallback() {
        this.cleanup.forEach(fn => fn());
        this.cleanup = [];
    }

    /**
     * @private
     */
    createPicker() {
        const container = this.querySelector(".picker");
        container.innerHTML = `
            <ui-secondary>Pick a Year</ui-secondary>
            <input
                type="number"
                value="${new Date(this.#store.ui.get('date-picker')).getFullYear()}"
            >
        `;

        // TODO: do a validation check, set `aria-invalid=true`
        this.#year = container.querySelector("input");
    }

    /**
     * @private
     */
    createDownload() {
        const container = this.querySelector(".download");

        this.#downloadButton = new ui.wc.Button();
        this.#downloadButton.setAttribute("color", "primary");
        this.#downloadButton.setAttribute("variant", "full");
        this.#downloadButton.onclick = () => {
            // TODO: create pdf and download
        };

        container.appendChild(this.#downloadButton);
    }

    /**
     * @private
     */
    onLang() {
        this.#downloadButton.innerText = this.#lang.ui.get("pdf", "button-download");
    }
}
