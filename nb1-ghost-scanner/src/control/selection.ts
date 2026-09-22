/// <reference types="typed-factorio/runtime" />

import type { LuaPlayer, OnSelectedEntityChangedEvent } from "factorio:runtime";
import { ScannerEntityName } from "../names.ts";
import { clearOverlay, drawOverlayFor } from "../overlay.ts";
import type { Storage } from "../types.ts";

declare const storage: Storage;

export function refreshOverlayForPlayer(player: LuaPlayer): void {
  const selected = player.selected;

  if (selected?.valid && selected.name === ScannerEntityName) {
    const id = selected.unit_number;

    if (id !== undefined) {
      const record = storage.scanners.get(id);

      if (record) {
        drawOverlayFor(player, record);
        return;
      }
    }
  }

  clearOverlay(player.index);
}

export function onSelectedEntityChanged(
  event: OnSelectedEntityChangedEvent,
): void {
  const player = game.get_player(event.player_index);

  if (player) {
    refreshOverlayForPlayer(player);
  }
}
