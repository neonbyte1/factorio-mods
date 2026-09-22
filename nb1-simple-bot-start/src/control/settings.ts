/// <reference types="typed-factorio/runtime" />

import { refreshConfig } from "../config.ts";

export function onSettingChanged(): void {
  refreshConfig();
}
