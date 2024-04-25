/**
 * @typedef DebugStore 
 * @type {boolean}
 *
 * @typedef ThemeStore
 * @type {{
 *  mode: "system" | "dark" | "light";
 *  name: string;
 * }}
 *
 * @typedef LangStore
 * @type {"en" | "de"}
 *
 * @typedef DatePickerStore
 * @type {string}
 *
 * @typedef WeekStartStore
 * @type {0 | 1}
 *
 * @typedef SettingsStore
 * @type {Settings}
 *
 * @typedef Shift
 * @type {{
 *  id: number; // Just a timestamp
 *  name: string;
 *  shortName: string;
 *  visible: boolean;
 *  color?: string;
 * }}
 *
 * @typedef Settings
 * @type {{
 *  shifts: Shift[];
 *  rhythm: number[];
 *  startDate: string; // "yyyy-mm-dd"
 * }}
 *
 * @typedef DBEntryDataItem
 * @type {{
 *  date: Date;
 *  shift: Shift | null;
 *  note: string;
 * }}
 *
 * @typedef DBEntryData
 * @type {DBEntryDataItem[]}
 *
 * @typedef DBEntry
 * @type {{
 *  id: string; // "YYYY/MM"
 *  data: DBEntryData;
 * }}
 *
 * @typedef Backup
 * @type {{
 *  settings: Settings;
 *  indexedDB: DBEntry[];
 * }}
 */

export { };
