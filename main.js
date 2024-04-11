import "./node_modules/ui/css/main.css";
import "./styles/main.css";

import { utils, ripple, svg } from "ui";
import constants from "./lib/constants";
import AppBar from "./lib/app-bar";
import StackLayout from "./lib/stack-layout";
import Storage from "./lib/storage";
import CalendarPage from "./pages/calendar";
import Language from "./lib/language";

const storage = new Storage();
const language = new Language();
language.setLanguage(storage.get("lang", constants.language))
  .then(() => storage.dispatch("lang"))

storage.addListener("lang", async (data) => {
  if (!data) {
    data = constants.language
  }

  await language.setLanguage(data)
  storage.dispatch("week-start") // This will trigger an update on the calendar week days
})

// TODO: Passing ".edit-mode" to the main.container if toggled on
document.querySelector("#app").innerHTML = `
    <main class="container ui-container is-debug">
        <div class="stack-layout"></div>
    </main>

    <header class="ui-app-bar ui-app-bar-top is-debug">
        <div class="ui-app-bar-main ui-container">
            <div>
                <div class="ui-grid-row">
                    <button
                        class="app-bar-back-button ui-icon-button ghost primary"
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
                <button
                    class="app-bar-edit-mode ui-icon-button ghost primary"
                    data-ripple="{}"
                >
                    ${svg.Edit2}
                </button>

                <button
                    class="app-bar-today ui-icon-button ghost primary"
                    data-ripple="{}"
                >
                    ${svg.TodayOutline}
                </button>

                <button
                    class="app-bar-pdf ui-icon-button ghost primary"
                    data-ripple="{}"
                >
                    ${svg.PDFDocument}
                </button>

                <button
                    class="app-bar-settings ui-icon-button ghost primary"
                    data-ripple="{}"
                >
                    ${svg.Settings}
                </button>
            </div>
        </div>
    </header>
`;

async function main() {
  createRipple();
  createThemeHandler();

  // NOTE: The app bar will handle the `currentDate`
  const appBar = new AppBar(document.querySelector(".ui-app-bar"), "");
  setAppBarHandlers(appBar);
  appBar.onMount()

  const stackLayout = new StackLayout(
    document.querySelector("main.container > .stack-layout"),
    appBar,
  );

  const calendarPage = new CalendarPage({ storage, language, appBar });

  stackLayout.setPage(calendarPage);
}

window.addEventListener("DOMContentLoaded", main);

async function createRipple() {
  const elements = document.querySelectorAll("*[data-ripple]");
  elements.forEach(async (el) => {
    ripple.create(el, JSON.parse(el.getAttribute("data-ripple") || "{}"));
  });
}

async function createThemeHandler() {
  const themeHandler = new utils.theme.ThemeHandler();

  themeHandler.addTheme("zinc", "/themes/zinc.css");
  themeHandler.loadTheme(constants.theme.name);

  {
    /** @param {StorageDataTheme} data */
    const themeStorageHandler = (data) => {
      if (!!data?.mode) {
        themeHandler.stop()
        themeHandler.setMode(data.mode)
      } else {
        themeHandler.start()
      }
    }

    themeStorageHandler(storage.get("theme", null))
    storage.addListener("theme", themeStorageHandler)
  }

  return themeHandler;
}

/**
 * @param {AppBar} appBar
 */
async function setAppBarHandlers(appBar) {
  appBar.getElement("backButton").onclick = () => {
    // ...
  }

  appBar.getElement("backButton").onclick = () => {
    // ...
  };

  appBar.getElement("datePicker").onclick = () => {
    // ...
  };

  appBar.getElement("editMode").onclick = () => {
    // ...
  };

  appBar.getElement("pdf").onclick = () => {
    // ...
  };

  appBar.getElement("settings").onclick = () => {
    // ...
  };
}
