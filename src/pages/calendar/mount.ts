import * as store from "../../store";
import * as utils from "../../utils";
import * as itemContent from "./item-content";
import * as constants from "./constants";
import * as handlers from "./handlers";

let appBarTitleBackup = "";

export async function onMount() {
    // Setup app bar
    appBarTitleBackup = utils.appBar.get();
    utils.appBar.set("");

    // Enable app-bar items
    setupAppBarItems();

    // Render day items
    renderDayItems();

    // TODO: Initialize the swipe handler, Continue here...

    // Setup store handlers
    setupStoreHandlers();
}

export async function onDestroy() {
    // Restore app bar title
    utils.appBar.set(appBarTitleBackup);
}

function renderDayItems() {
    Array.from(document.querySelector(constants.query.itemContainer)!.children)!.forEach((item) => {
        item.innerHTML = "";
        item.appendChild(itemContent.create());
    });
}

function setupAppBarItems() {
    // TODO: ...
}

function setupStoreHandlers() {
    store.obj.listen("date-picker", handlers.datePicker, true);
    store.obj.listen("week-start", handlers.weekStart, true);
    store.obj.listen("edit-mode", handlers.editMode, true);
}
