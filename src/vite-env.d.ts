/// <reference types="svelte" />
/// <reference types="vite/client" />

declare type Views = "calendar" | "settings";

declare type Themes = "default" | "custom" | "green";

declare interface DatePickerCurrent {
  year: number;
  month: number;
}

declare interface GridItemData {
  title: string;
  disabled?: boolean;
  today?: boolean;
}

declare interface ShiftItem {
  name: string;
  visible: boolean;
}