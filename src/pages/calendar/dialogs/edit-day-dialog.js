import ui from "ui";
import db from "../../../db";
import * as utils from "../utils";

/**
 * @typedef {import("ui/src/wc").Store<import("../../../types").StoreEvents>} Store
 * @typedef {import("ui/src/wc").Lang} Lang
 * @typedef {import("ui/src/wc").Select} Select
 * @typedef {import("ui/src/wc").Button} Button
 * @typedef {import("ui/src/wc").FlexGrid} FlexGrid
 * @typedef {import("ui/src/wc/dialog/dialog").DialogEvents} DialogEvents 
 * @typedef {import("../../../types").DBDataEntry} DBDataEntry
 */

/** @extends {ui.wc.Dialog<DialogEvents>} */
export class EditDayDialog extends ui.wc.Dialog {
    /** @type {Store} */
    #store;
    /** @type {Lang} */
    #lang;

    /** @type {number} */
    #year = 0;
    /** @type {number} */
    #month = 0;
    /** @type {number} */
    #date = 0;

    /** @type {Select} */
    #shiftSelect;
    /** @type {HTMLTextAreaElement} */
    #notes;

    /** @type {Button} */
    #cancelButton;
    /** @type {() => void|Promise<void>} */
    #onCancel = () => this.ui.close();

    /** @type {Button} */
    #submitButton;
    /** @type {() => void|Promise<void>} */
    #onSubmit = () => {
        // TODO: Save note and shift, close the dialog
        this.ui.close();
    };

    static register = () => customElements.define("edit-day-dialog", EditDayDialog);

    /**
     * @param {Store} store
     * @param {Lang} lang
     */
    constructor(store, lang) { // {{{
        super()

        this.#store = store;
        this.#lang = lang;

        this.cleanup = [];
        /** @type {DBDataEntry | null} */
        this.data = null;

        this.createContent();
        this.createActions();
    } // }}}

    connectedCallback() { // {{{
        super.connectedCallback();

        // TODO: ... (`this.#shiftsSelect`)
        //  ...Get all shifts from settings
        //  ...Add shifts to ui-select element 
        //  ...set current active shift (`this.rhythmShift` or `this.data.shift` or undefined)
        //  ...Do a database add/put/delete based on selection, delete if rhythmShift was choosen
        //  ...Mark the rhythmShift somehow
        setTimeout(() => {
            this.cleanup.push(
                this.#store.ui.on("lang", this.onLang.bind(this), true),
            );
        });
    } // }}}

    disconnectedCallback() { // {{{
        super.disconnectedCallback();
        this.cleanup.forEach(fn => fn());
        this.cleanup = [];
    } // }}}

    /**
     * @param {number} year
     * @param {number} month
     * @param {number} date
     */
    async set(year, month, date) { // {{{
        this.#year = year;
        this.#month = month;
        this.#date = date;

        this.data = await db.get(year, month, date);
        this.rhythmShift = utils.calcShiftForDay(new Date(year, month, date), this.#store.ui.get("settings"));
        if (this.data === null) {
            this.data = {
                year, month, date,
                shift: null,
                note: "",
            };
        }
    } // }}}

    /** @private */
    createContent() { // {{{
        const content = new ui.wc.FlexGrid();

        content.setAttribute("gap", "0.5rem");

        this.createShiftsPicker(content);
        this.createNotes(content);

        this.appendChild(content);
    } // }}}

    /**
     * @private
     * @param {FlexGrid} container
     */
    createShiftsPicker(container) { // {{{
        const item = new ui.wc.FlexGridItem();

        this.#shiftSelect = new ui.wc.Select();

        item.appendChild(this.#shiftSelect);
        container.appendChild(item);

    } // }}}

    /**
     * @private
     * @param {FlexGrid} container
     */
    createNotes(container) { // {{{
        this.notesItem = new ui.wc.FlexGridItem();
        this.notesItem.innerHTML = `
            <ui-secondary><ui-secondary>
            <textfield></textfield>
        `;

        this.#notes = this.notesItem.querySelector("textfield")

        container.appendChild(this.notesItem);
    } // }}}

    /** @private */
    createActions() { // {{{
        // Cancel
        let item = new ui.wc.FlexGridItem();
        item.slot = "actions"
        item.setAttribute("flex", "0")
        item.innerHTML = `
            <ui-button variant="full" color="secondary"></ui-button>
        `;
        this.#cancelButton = item.querySelector("ui-button");
        this.#cancelButton.onclick = this.#onCancel;
        this.appendChild(item)

        // Submit
        item = new ui.wc.FlexGridItem();
        item.slot = "actions"
        item.setAttribute("flex", "0")
        item.innerHTML = `
            <ui-button variant="full" color="primary"></ui-button>
        `;
        this.#submitButton = item.querySelector("ui-button");
        this.#submitButton.onclick = this.#onSubmit;
        this.appendChild(item)
    } // }}}

    /** @private */
    onLang() { // {{{
        //const weekDay = this.#lang.ui.get("calendar", new Date(this.#year, this.#month, this.#date).getDay().toString());
        this.ui.title = `${this.#year}/${this.#month}/${this.#date}`;

        this.notesItem.querySelector("ui-secondary").innerHTML =
            this.#lang.ui.get("calendarDialog", "editDayNotes");

        this.#cancelButton.innerText = this.#lang.ui.get("general", "cancelButton");
        this.#submitButton.innerText = this.#lang.ui.get("general", "submitButton");
    } // }}}
}
