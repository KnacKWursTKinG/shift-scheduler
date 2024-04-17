import ui from "ui";
import { StackLayoutPage } from "../components";
import { constants } from "../lib";

export class Calendar extends StackLayoutPage {
    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();

        // TODO: start/add calendar page events and shit here
    }

    disconnectedCallback() {
        super.connectedCallback();

        // TODO: remove calendar page events and shit here
    }
}

class SwipeHandler extends ui.events.Events {
    /** @type {Calendar} */
    #root;
    /** @type {boolean} */
    #kill;

    /** @type {((ev: TouchEvent) => void|Promise<void>)} */
    #onTouchMove;
    /** @type {((ev: TouchEvent) => void|Promise<void>)} */
    #onTouchEnd;
    /** @type {((ev: TouchEvent) => void|Promise<void>)} */
    #onTouchCancel;

    /** @type {(() => void|Promise<void>)} */
    #animationFrameHandler;

    /** @type {number | null} */
    #startX;
    /** @type {number | null} */
    #clientX;

    /** @type {boolean} */
    #finalTransformRunning;

    /**
     * @param {Calendar} root
     */
    constructor(root) {
        super();

        this.#root = root;
        this.#kill = false;

        this.#startX = null;
        this.#clientX = null;
        this.#finalTransformRunning = false;

        this.#onTouchMove = async (ev) => {
            if (this.#finalTransformRunning) return;
            if (this.#startX === null) this.#startX = ev.touches[0].clientX;
            this.#clientX = ev.touches[0].clientX;
        };

        this.#onTouchEnd = async () => {
            if (this.#startX === null || this.#finalTransformRunning) return;
            this.#finalTransformRunning = true;

            // Start final transform
            if (constants.debug)
                console.log(`[Calendar SwipeHandler] transform lock`);

            if (!this.#isMinSwipe()) {
                this.#setTransition(`transform ${0.1}s ease`);
                this.#transform("0%");
                setTimeout(() => this.#resetSwipe(), 100);
                return;
            }

            this.#setTransition(`transform ${0.3}s ease`);
            this.#transform(this.#clientX > this.#startX ? "-100%" : "100%");
            setTimeout(() => this.#resetSwipe(), 300);
        };

        this.#onTouchCancel = async (ev) => {
            if (this.#startX !== null) await this.#onTouchEnd(ev);
        };

        this.#animationFrameHandler = async () => {
            if (this.#kill) return;
            if (this.#finalTransformRunning || this.#startX === null) {
                requestAnimationFrame(this.#animationFrameHandler);
                return;
            }

            this.#transform(`${this.#startX - this.#clientX}px`);
            requestAnimationFrame(this.#animationFrameHandler);
        };
    }

    start() {
        this.#root.addEventListener("touchmove", this.#onTouchMove);
        this.#root.addEventListener("touchend", this.#onTouchEnd);
        this.#root.addEventListener("touchcancel", this.#onTouchCancel);

        requestAnimationFrame(this.#animationFrameHandler);
    }

    stop() {
        this.#root.removeEventListener("touchmove", this.#onTouchMove);
        this.#root.removeEventListener("touchend", this.#onTouchEnd);
        this.#root.removeEventListener("touchcancel", this.#onTouchCancel);

        this.#kill = false;
    }

    /**
     * @param {"swipe"} key
     * @param {"left" | "right" | "none"} data
     */
    dispatchWithData(key, data) {
        super.dispatchWithData(key, data);
        return this;
    }

    /**
     * @param {"swipe"} key
     * @param {(data: "left" | "right" | "none") => void|Promise<void>} listener
     * @returns {() => void} clean up function
     */
    addListener(key, listener) {
        return super.addListener(key, listener);
    }

    /**
     * @param {"swipe"} key
     * @param {(data: "left" | "right" | "none") => void|Promise<void>} listener
     */
    removeListener(key, listener) {
        super.removeListener(key, listener);
        return this;
    }

    #resetSwipe() {
        // Reset final transform
        this.#setTransition("none");
        if (this.#isMinSwipe()) {
            this.#reorderItems(this.#clientX > this.#startX ? "right" : "left");
        }
        this.#startX = null;
        this.#clientX = null;
        this.#finalTransformRunning = false;
        if (constants.debug)
            console.log(`[Calendar SwipeHandler] release transform lock`);
    }

    /**
     * @param {string} diff
     */
    #transform(diff) {
        [...this.#root.children].forEach((c) => {
            // @ts-ignore
            c.style.transform = `translateX(calc(-100% - ${diff}))`;
        });
    }

    /**
     * @param {string} value
     */
    #setTransition(value) {
        [...this.#root.children].forEach((c) => {
            // @ts-ignore
            c.style.transition = value;
        });
    }

    /**
     * @param {"left" | "right" | "none" | string} swipeDirection
     */
    #reorderItems(swipeDirection) {
        switch (swipeDirection) {
            case "left":
                // The first item will be the last
                this.#root.appendChild(
                    this.#root.removeChild(this.#root.firstChild),
                );
                break;
            case "right":
                // The last item will be the first
                this.#root.insertBefore(
                    this.#root.removeChild(this.#root.lastChild),
                    this.#root.children[0],
                );
                break;
            case "none":
                break;
            default:
                throw `Ooop, what is this for a direction "${swipeDirection}"?`;
        }

        this.#transform("0%");
        this.dispatchWithData("swipe", swipeDirection);
    }

    #isMinSwipe() {
        return (
            Math.abs(this.#startX - this.#clientX) >
            constants.swipeRange * (window.innerWidth / 1080)
        );
    }
}

/**
 * @param {Date} month
 * @param {import("../lib/storage").StorageDataWeekStart} weekStart
 * @returns {Promise<import("../lib/db").DBMonth>}
 */
async function getMonthArray(month, weekStart) {
    /** @type {import("../lib/db").DBMonth} */
    const data = [];

    for (let i = 0; i < 42; i++) {
        data.push({
            date: new Date(
                month.getFullYear(),
                month.getMonth(),
                i + 1 - _getStartDay(month, weekStart),
            ),
            shift: null, // TODO: Calc the current shift (rhythm)
            note: "",
        });
    }

    return data;
}

/**
 * @param {import("../lib/db").default | null} db
 * @param {Date} month
 * @param {import("../lib/db").DBMonth} days
 * @returns {Promise<import("../lib/db").DBMonth>}
 */
async function fillWithData(db, month, days) {
    // TODO: Fill days array with data from the database
    // ...

    return days;
}

/**
 * @param {Date} month
 * @param {import("../lib/storage").StorageDataWeekStart} weekStart
 * @returns {number}
 */
function _getStartDay(month, weekStart) {
    // NOTE: if month starts on sunday (0), but the week start is set to monday (1), than set it to 6 (sunday becomes 6)
    month.setDate(1); // 0-6 Sun-Sat
    const d = month.getDay();
    if (weekStart === 0) return d;
    else if (weekStart === 1) return d === 0 ? 6 : d - 1; // NOTE: This works as long the weekStart is a 0 or a 1
}
