import { Filesystem, Encoding, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import * as jspdf from "jspdf";
import autoTable from "jspdf-autotable";
import utils from "../../utils";
import * as calendarUtils from "../calendar/utils";

/**
 * @typedef {import("../../types").DBDataEntry} DBDataEntry
 * @typedef {import("../../types").Shift} Shift
 */

/**
 * @param {Object} options
 * @param {number | null} [options.year]
 * @param {number | null} [options.month]
 */
export async function create({ year = null, month = null }) {
    const today = new Date();
    if (month === null && year === null) month = today.getMonth();
    if (year === null) year = today.getFullYear();

    const doc = new jspdf.jsPDF();

    const months = month !== null ? [month] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    let pageIndex = 0;
    for (const month of months) {
        if (pageIndex === 3) {
            doc.addPage();
            pageIndex = 1;
        } else {
            pageIndex++;
        }

        const mA = await calendarUtils.getArray(year, month, document.querySelector("ui-store"));
        autoTable(doc, {
            // TODO: handle week start
            head: [['Sun', 'Mon', 'Thu', "Wed", "Thu", "Fri", "Ä, Ö"]],
            body: [
                getRow(month, mA.slice(0, 7)),
                getRow(month, mA.slice(7, 14)),
                getRow(month, mA.slice(14, 21)),
                getRow(month, mA.slice(21, 28)),
                getRow(month, mA.slice(28, 35)),
                getRow(month, mA.slice(35, 42)),
            ],
            styles: {
                halign: "center",
            },
        });
    }

    await exportDoc(doc, 2024);
}

/**
 * @param {number} month
 * @param {DBDataEntry[]} a
 */
function getRow(month, a) {
    return a.slice(0, 7).map(a => {
        const name = a.shift?.visible
            ? (a.shift?.name || "")
            : "";
        return a.month === month ? `${a.date}\n${name}` : "";
    });
}

/**
 * @param {jspdf.jsPDF} doc
 * @param {number} year
 */
async function exportDoc(doc, year) {
    const fileName = `${year}.pdf`;

    if (utils.isAndroid()) {
        const result = await Filesystem.writeFile({
            path: fileName,
            // @ts-ignore
            data: doc.output("datauri"),
            //encoding: Encoding.UTF8,
            directory: Directory.Cache,
        });

        await Share.share({
            title: `${year}`,
            // @ts-ignore
            url: result.uri,
            dialogTitle: `Share "${fileName}"`,
        });

        return;
    }

    doc.save(fileName);
}
