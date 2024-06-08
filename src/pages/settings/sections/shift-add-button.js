import { UIButton } from "ui";
import { CleanUp } from "ui/src/js";
import { EditShiftDialog } from "../../../dialogs";

/**
 * @typedef {import("../../../types").UIStoreEvents} UIStoreEvents
 * @typedef {import("../../../types").Shift} Shift
 */

export class ShiftAddButton extends UIButton {

    static register = () => {
        UIButton.register();

        EditShiftDialog.register();

        customElements.define("settings-shift-add-button", ShiftAddButton)
    };

    /**
     * @param {import("ui").UIStore<UIStoreEvents>} store
     * @param {import("ui").UILang} lang
     */
    constructor(store, lang) { // {{{
        super();
        super.setAttribute("color", "primary")
        super.setAttribute("variant", "full")

        /** @type {import("ui").UIStore<UIStoreEvents>} */
        this.uiStore = store;
        /** @type {import("ui").UILang} */
        this.uiLang = lang;

        this.cleanup = new CleanUp();
    } // }}}

    connectedCallback() { // {{{
        super.connectedCallback()
        this.handleEvents()

        this.cleanup.add(
            this.uiStore.ui.on("lang", this.onLang.bind(this), true),
        );
    } // }}}

    disconnectedCallback() {
        this.cleanup.run();
    }

    /** @private */
    handleEvents() { // {{{
        const onClose = async (/**@type{EditShiftDialog}*/dialog) => { // {{{
            document.body.removeChild(dialog);
        } // }}}

        const onClick = () => { // {{{
            /** @type {Shift} */
            let shift = {
                id: new Date().getTime(),
                name: "",
                shortName: "",
                visible: true,
                color: null,
            };

            const dialog = new EditShiftDialog(shift, this.uiStore, this.uiLang);
            document.body.appendChild(dialog)

            dialog.ui.open(true);
            dialog.ui.events.on("close", () => onClose(dialog));

            /**
             * @param {Shift} newShift
             */
            const onSubmit = async (newShift) => { // {{{
                if (!newShift.name) {
                    alert(this.uiLang.ui.get("edit-shift-alerts", "missing-name"));

                    shift = newShift;

                    const dialog = new EditShiftDialog(shift, this.uiStore, this.uiLang);
                    document.body.appendChild(dialog)

                    dialog.ui.open(true);
                    dialog.ui.events.on("close", () => onClose(dialog));
                    dialog.ui.events.on("submit", onSubmit);

                    return;
                }

                if (!newShift.shortName) {
                    newShift.shortName = newShift.name.slice(0, 2)
                }

                this.uiStore.ui.update("settings", (settings) => {
                    return {
                        ...settings,
                        shifts: [...settings.shifts, newShift],
                    };
                });
            }; // }}}

            dialog.ui.events.on("submit", onSubmit);
        } // }}}

        this.addEventListener("click", onClick);
        this.cleanup.add(() => this.removeEventListener("click", onClick));
    } // }}}

    /** @private */
    async onLang() { // {{{
        this.innerHTML = this.uiLang.ui.get("settings", "button-add-shift");
    } // }}}
} // }}}
