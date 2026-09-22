/// <reference types="typed-factorio/runtime" />

import type { Color, LuaPlayer, PlayerIndex } from "factorio:runtime";
import {
  OverlayBorderColorSetting,
  OverlayFillColorSetting,
} from "./setting_names.ts";
import type { ScannerRecord, Storage } from "./types.ts";

declare const storage: Storage;

const OUTLINE_WIDTH = 3;
const BorderFallback: Color = { r: 1.0, g: 0.85, b: 0.2, a: 1.0 };
const FillFallback: Color = { r: 1.0, g: 0.85, b: 0.2, a: 0.12 };

function isColor(v: unknown): v is Color {
  if (v === undefined || v === null || typeof v !== "object") {
    return false;
  }

  return (
    "r" in v && typeof (v as { r: unknown }).r === "number" &&
    "g" in v && typeof (v as { g: unknown }).g === "number" &&
    "b" in v && typeof (v as { b: unknown }).b === "number"
  );
}

function readPlayerColor(
  player: LuaPlayer,
  setting: string,
  fallback: Color,
): Color {
  const raw = settings.get_player_settings(player)[setting];

  if (raw?.value && isColor(raw.value)) {
    const { r, g, b, a } = raw.value;
    return {
      r,
      g,
      b,
      a: a ?? 1.0,
    };
  }

  return fallback;
}

export function clearOverlay(playerIndex: PlayerIndex): void {
  const ids = storage.overlays.get(playerIndex);

  if (ids) {
    for (const id of ids) {
      const obj = rendering.get_object_by_id(id);
      if (obj && obj.valid) obj.destroy();
    }
    storage.overlays.delete(playerIndex);
  }
}

export function drawOverlayFor(
  player: LuaPlayer,
  record: ScannerRecord,
): void {
  clearOverlay(player.index);

  if (record.mode !== "area" || !record.area) {
    return;
  }

  const surface = record.entity.surface;

  if (!surface || !surface.valid) {
    return;
  }

  const { left_top, right_bottom } = record.area;
  const fillColor = readPlayerColor(
    player,
    OverlayFillColorSetting,
    FillFallback,
  );

  const borderColor = readPlayerColor(
    player,
    OverlayBorderColorSetting,
    BorderFallback,
  );

  const fill = rendering.draw_rectangle({
    surface,
    left_top,
    right_bottom,
    color: fillColor,
    filled: true,
    draw_on_ground: true,
    players: [player.index],
  });

  const outline = rendering.draw_rectangle({
    surface,
    left_top,
    right_bottom,
    color: borderColor,
    filled: false,
    width: OUTLINE_WIDTH,
    players: [player.index],
  });

  storage.overlays.set(player.index, [fill.id, outline.id]);
}
