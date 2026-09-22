/// <reference types="typed-factorio/runtime" />

import type {
  OnPlayerCursorStackChangedEvent,
  OnPlayerSelectedAreaEvent,
} from "factorio:runtime";
import { Config } from "../config.ts";
import { cancelAreaSelection, openGui } from "../gui.ts";
import { AreaSelectorItemName } from "../names.ts";
import { clearScanState } from "../scan.ts";
import type { Storage } from "../types.ts";

declare const storage: Storage;

export function onPlayerSelectedArea(
  event: OnPlayerSelectedAreaEvent,
): void {
  if (event.item !== AreaSelectorItemName) {
    return;
  }

  const player = game.get_player(event.player_index);

  if (!player) {
    return;
  }

  const scannerId = storage.playersAwaitingArea.get(event.player_index);
  const stack = player.cursor_stack;

  storage.playersAwaitingArea.delete(event.player_index);

  if (stack && stack.valid_for_read && stack.name === AreaSelectorItemName) {
    stack.clear();
  }

  if (scannerId === undefined) {
    return;
  }

  const record = storage.scanners.get(scannerId);

  if (!record) {
    return;
  }

  if (event.surface.index !== record.entity.surface.index) {
    player.print([
      "",
      "[Ghost Scanner] Area must be selected on the same surface as the scanner.",
    ]);
    return;
  }

  const left = math.floor(event.area.left_top.x);
  const top = math.floor(event.area.left_top.y);
  const right = math.ceil(event.area.right_bottom.x);
  const bottom = math.ceil(event.area.right_bottom.y);
  const side = math.max(right - left, bottom - top);

  if (side > Config.areaMaxSide) {
    player.print([
      "",
      "[Ghost Scanner] Area too large (max side ",
      string.format("%d", Config.areaMaxSide),
      " tiles).",
    ]);
    return;
  }

  record.area = {
    left_top: { x: left, y: top },
    right_bottom: { x: right, y: bottom },
  };
  record.mode = "area";

  clearScanState(record.id);
  openGui(player, record);
}

export function onPlayerCursorStackChanged(
  event: OnPlayerCursorStackChangedEvent,
): void {
  if (storage.playersAwaitingArea.has(event.player_index)) {
    const player = game.get_player(event.player_index);

    if (player) {
      const stack = player.cursor_stack;

      if (
        !stack || !stack.valid_for_read || stack.name !== AreaSelectorItemName
      ) {
        cancelAreaSelection(event.player_index);
      }
    }
  }
}
