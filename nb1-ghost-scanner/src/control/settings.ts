/// <reference types="typed-factorio/runtime" />

import type { OnRuntimeModSettingChangedEvent } from "factorio:runtime";
import { refreshConfig } from "../config.ts";
import {
  OverlayBorderColorSetting,
  OverlayFillColorSetting,
} from "../setting_names.ts";
import type { Storage } from "../types.ts";
import { refreshOverlayForPlayer } from "./selection.ts";

declare const storage: Storage;

export function onSettingChanged(
  event: OnRuntimeModSettingChangedEvent,
): void {
  refreshConfig();

  // ShowHidden affects the items_to_place_this cache. Rebuild on every
  // setting change to keep the code simple; the cache repopulates lazily.
  storage.lookupItemsToPlaceThis = new LuaMap();

  if (
    event.setting_type === "runtime-per-user" &&
    event.player_index !== undefined
  ) {
    if (
      event.setting === OverlayBorderColorSetting ||
      event.setting === OverlayFillColorSetting
    ) {
      const player = game.get_player(event.player_index);

      if (player) {
        refreshOverlayForPlayer(player);
      }
    }
  }
}
