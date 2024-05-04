import ui from "ui"
import { ShiftCard } from "../../../components"

/**
 * @typedef {import("ui/src/wc").Store<import("../../../types").StoreEvents>} Store
 * @typedef {import("ui/src/wc").Lang} Lang
 * @typedef {import("ui/src/wc").Button} Button
 * @typedef {import("ui/src/wc").FlexGrid} FlexGrid
 *
 * @typedef {import("../../../types").SettingsStore} SettingsStore
 */

// {{{ Content HTML

const contentHTML = `
<ui-flex-grid-item style="height: 100%;">
    <table>
        <thead>
            <tr>
                <th style="text-align: left;"></th>
                <th style="text-align: left;"></th>
                <th style="text-align: right;"></ht>
            </tr>
        </thead>

        <tbody>
        </tbody>
    </table>
</ui-flex-grid-item>

<ui-flex-grid-item style="position: relative; max-height: 1.6rem;">
    <hr
        style="
            position: absolute;
            top: var(--spacing);
            left: 0;
            width: 100%;
        "
    />

    <ui-secondary
        id="shiftsEditRhythmDialogPickerSecondary"
        style="
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            display: block;
            text-align: center;
            background-color: hsl(var(--bg));
            padding: 0 var(--spacing);
            white-space: nowrap;
        "
    >...</ui-secondary>
</ui-flex-grid-item>

<ui-flex-grid-item
    class="picker"
    flex="0"
    style="
        max-height: fit-content;
        position: relative;
    "
>
    <ui-flex-grid-row
        class="shifts no-scrollbar"
        style="
            width: 100%;
            height: fit-content;
            overflow: hidden;
            overflow-x: scroll;
        "
        gap="0.25rem"
    ></ui-flex-grid-row>
</ui-flex-grid-item>
`

// }}}

export class EditRhythmDialog extends ui.wc.Dialog {
    /** @type {Store} */
    #store
    /** @type {Lang} */
    #lang

    /** @type {Button} */
    #submitButton
    /** @type {() => void|Promise<void>} */
    #onSubmit = () => {
        this.#store.ui.update("settings", (settings) => {
            return {
                ...settings,
                rhythm: this.#rhythm,
            };
        });
        this.ui.close();
    }

    /** @type {FlexGrid} */
    #content

    /** @type {number[]} */
    #rhythm

    static register = () => customElements.define("edit-rhythm-dialog", EditRhythmDialog)

    /**
     * @param {Store} store
     * @param {Lang} lang
     */
    constructor(store, lang) { // {{{
        super()
        this.#store = store
        this.#lang = lang

        this.ui.fullscreen = true

        this.cleanup = []
        this._createActionButtons()
        this._createContent()
    } // }}}

    connectedCallback() { // {{{ store: "lang", "settings"
        super.connectedCallback()

        setTimeout(() => {
            this.cleanup.push(
                this.#store.ui.on("lang", () => {
                    this.ui.title = this.#lang.ui.get("settings", "shiftsEditRhythmDialogTitle");
                    this.#submitButton.innerText =
                        this.#lang.ui.get("settings", "shiftsEditRhythmDialogSubmitButton");

                    this.#content.querySelector("thead th:nth-child(1)").innerHTML =
                        this.#lang.ui.get("settings", "shiftsTableHeaderName");
                    this.#content.querySelector("thead th:nth-child(2)").innerHTML =
                        this.#lang.ui.get("settings", "shiftsTableHeaderShortName");

                    this.#content.querySelector("#shiftsEditRhythmDialogPickerSecondary").innerHTML =
                        this.#lang.ui.get("settings", "shiftsEditRhythmDialogPickerSecondary");
                }, true),

                this.#store.ui.on("settings", (settings) => {
                    this.#rhythm = settings.rhythm
                    this._renderTable(settings)
                    this._renderShiftsPicker(settings)
                }, true),
            )
        })
    } // }}}

    disconnectedCallback() { // {{{
        super.disconnectedCallback()

        this.cleanup.forEach(fn => fn())
        this.cleanup = []
    } // }}}

    /**
     * @param {SettingsStore} settings
     */
    _renderTable(settings) { // {{{
        const tbody = this.#content.querySelector("tbody");
        while (!!tbody.firstChild) tbody.removeChild(tbody.firstChild);

        let draggedIndex = null;
        this.#rhythm.forEach((id, index) => {
            const shift = settings.shifts.find(shift => shift.id === id)
            if (!shift) {
                console.error(`shift with id of "${id}" is missing in shifts`)
                return
            }

            // Create a table entry for this shift
            const tr = document.createElement("tr")

            // Table Data Name
            const tdName = document.createElement("td")
            tdName.innerText = shift.name
            tr.appendChild(tdName)

            // Table Data Short Name
            const tdShortName = document.createElement("td")
            tdShortName.innerText = !!shift.visible ? shift.shortName : ""
            tdShortName.style.color = shift.color || "inherit"
            tr.appendChild(tdShortName)

            // Table Data Actions
            const tdActions = document.createElement("td")
            const btnDelete = new ui.wc.IconButton()
            btnDelete.setAttribute("color", "destructive")
            btnDelete.setAttribute("ghost", "")
            btnDelete.appendChild(new ui.wc.svg.DeleteRecycleBin())
            btnDelete.onclick = async () => {
                tbody.removeChild(tr);
                this.#rhythm = this.#rhythm.filter((_n, i) => i !== index);
                this._renderTable(settings)
            };
            tdActions.appendChild(btnDelete)

            tr.appendChild(tdActions)

            tbody.appendChild(tr)

            ui.js.draggable.create(tr, {
                onDragStart: async () => {
                    draggedIndex = index
                },

                onDragging: async () => {
                    if (draggedIndex === null) return;

                    [...tbody.children].forEach((/**@type{HTMLElement}*/child, ci) => {
                        if (ci !== index) {
                            child.style.background = "inherit"
                            child.style.color = "inherit"
                            return
                        }

                        child.style.background = "hsl(var(--primary))"
                        child.style.color = "hsl(var(--primary-fg))"
                    });
                },

                onDragEnd: async () => {
                    if (draggedIndex === null) return

                    if (draggedIndex < index) { // dragged down
                        this.#rhythm = [
                            ...this.#rhythm.slice(0, draggedIndex),
                            ...this.#rhythm.slice(draggedIndex + 1, index + 1),
                            this.#rhythm[draggedIndex],
                            ...this.#rhythm.slice(index + 1),
                        ];

                        this._renderTable(settings)
                    } else if (draggedIndex > index) { // dragged up
                        this.#rhythm = [
                            ...this.#rhythm.slice(0, index),
                            this.#rhythm[draggedIndex],
                            ...this.#rhythm.slice(index, draggedIndex),
                            ...this.#rhythm.slice(draggedIndex + 1),
                        ]

                        this._renderTable(settings)
                    }

                    draggedIndex = null
                },
            });
        });
    } // }}}

    /**
     * Add a `ShiftCard` for each shift in `settings.shifts` to the `shiftsPicker` element
     *
     * @param {SettingsStore} settings
     */
    _renderShiftsPicker(settings) { // {{{
        const picker = this.#content.querySelector(".picker .shifts");
        while (picker.firstChild) picker.removeChild(picker.firstChild);

        settings.shifts.forEach(shift => {
            const item = new ui.wc.FlexGridItem();
            const shiftCard = new ShiftCard();
            shiftCard.setAttribute("color", !!shift.visible ? (shift.color || "hsl(var(--card-fg))") : "transparent");
            shiftCard.innerHTML = `
                <span slot="name">${shift.name}</span>
                <span slot="short-name">${shift.shortName}</span>
            `;
            shiftCard.onclick = () => {
                this.#rhythm.push(shift.id);
                this._renderTable(settings)
            };
            item.appendChild(shiftCard);
            picker.appendChild(item);
        });
    } // }}}

    _createActionButtons() { // {{{
        // Add Submit button to the "actions" slot
        this.#submitButton = new ui.wc.Button()
        this.#submitButton.slot = "actions"
        this.#submitButton.setAttribute("variant", "full")
        this.#submitButton.setAttribute("color", "primary")
        this.#submitButton.innerText = "" // set text in "lang" event handler

        this.#submitButton.addEventListener("click", this.#onSubmit)
        this.cleanup.push(() => this.#submitButton.onclick = this.#onSubmit)

        this.appendChild(this.#submitButton)
    } // }}}

    _createContent() { // {{{
        this.#content = new ui.wc.FlexGrid()
        this.#content.style.width = "100%"
        this.#content.style.height = "100%"
        this.#content.innerHTML = contentHTML
        this.appendChild(this.#content)
    } // }}}
}
