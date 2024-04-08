import "./node_modules/ui/css/main.css"
import "./style.css"

import { utils, ripple, svg } from "ui"
import constants from "./lib/constants"
import AppBar from "./lib/app-bar"
import StackLayout from "./lib/stack-layout"
import Storage from "./lib/storage"
import DatePicker from "./lib/date-picker"

const storage = new Storage()

document.querySelector('#app').innerHTML = `
    <main class="container ui-container is-debug">
        <div class="stack-layout is-max"></div>
    </main>

    <header class="ui-app-bar ui-app-bar-top is-debug">
        <div class="ui-app-bar-main ui-container">
            <div>
                <div class="ui-grid-row">
                    <button
                        class="app-bar-back-button ui-icon-button ghost primary"
                        style="display: none;"
                        data-ripple="{}"
                    >
                        ${svg.BackArrowNavigation}
                    </button>

                    <button
                        class="app-bar-date-picker ui-button outline primary"
                        data-ripple="{}"
                    >
                        Date Picker
                    </button>
                </div>
            </div>

            <div>
                <h4 class="app-bar-title"></h4>
            </div>

            <div>
                <!-- TODO: Add icons and update app-bar -->
                    <button
                        class="app-bar-edit-mode ui-icon-button ghost primary"
                        style="display: none;"
                        data-ripple="{}"
                    >
                    </button>

                    <button
                        class="app-bar-today ui-icon-button ghost primary"
                        style="display: none;"
                        data-ripple="{}"
                    >
                    </button>

                    <button
                        class="app-bar-pdf ui-icon-button ghost primary"
                        style="display: none;"
                        data-ripple="{}"
                    >
                    </button>

                    <button
                        class="app-bar-settings ui-icon-button ghost primary"
                        style="display: none;"
                        data-ripple="{}"
                    >
                    </button>
            </div>
        </div>
    </header>
`

async function main() {
    createRipple()

    const themeHandler = await createThemeHandler()
    themeHandler.start()

    const datePicker = new DatePicker(new Date())

    const appBar = new AppBar(
        document.querySelector(".ui-app-bar"),
        datePicker,
    )

    const stackLayout = new StackLayout(
        document.querySelector("main.container > .stack-layout"),
        appBar,
    )

    // TODO: ...
}

window.addEventListener("DOMContentLoaded", main)

async function createRipple() {
    const elements = document.querySelectorAll("*[data-ripple]")
    elements.forEach(async (el) => {
        ripple.create(el, JSON.parse(el.getAttribute("data-ripple") || "{}"))
    })
}

async function createThemeHandler() {
    const themeHandler = new utils.theme.ThemeHandler()

    themeHandler.addTheme("zinc", "/themes/zinc.css")
    themeHandler.loadTheme(constants.theme.name)

    const theme = storage.get("theme", null)
    if (theme?.mode) {
        themeHandler.setMode(theme.mode)
    }

    return themeHandler
}
