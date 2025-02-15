import * as store from "../../store";
import * as types from "../../types";

import * as constants from "./constants";
import * as lib from "./lib";
import * as itemContent from "./item-content/";

export async function datePicker(dateString: string): Promise<void> {
    const date = new Date(dateString);
    date.setMonth(date.getMonth() - 1);

    Array.from(document.querySelector(constants.query.itemContainer)!.children).forEach(
        // Update item-container > item
        async (item) => {
            itemContent.update(
                item.querySelector(itemContent.constants.query.itemContent)!,
                new Date(date),
            );
        },

        date.setMonth(date.getMonth() + 1),
    );
}

export async function weekStart(data: types.calendar.WeekStart): Promise<void> {
    // TODO: ...
}

export async function editMode(data: types.calendar.EditMode): Promise<void> {
    // TODO: ...
}

export async function swipe(direction: lib.Direction): Promise<void> {
    switch (direction) {
        case "left":
            // Go to next month
            store.obj.update("date-picker", (dateString) => {
                const date = new Date(dateString);
                date.setMonth(date.getMonth() + 1);
                return date.toString();
            });

            break;

        case "right":
            // Go to prev month
            store.obj.update("date-picker", (dateString) => {
                const date = new Date(dateString);
                date.setMonth(date.getMonth() - 1);
                return date.toString();
            });

            break;
    }
}
