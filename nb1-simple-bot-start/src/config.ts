/// <reference types="typed-factorio/runtime" />

import type { ModSetting } from "factorio:runtime";
import {
  AllowHelpMeJaredSetting,
  MovementModifierSetting,
  RespawnKitSetting,
} from "./setting_names.ts";

export const Config = {
  movementModifier: 0.9,
  respawnKit: true,
  allowHelpMeJared: false,
};

function readSettings(node: ModSetting | undefined, fallback: number): number;
function readSettings(
  node: ModSetting | undefined,
  fallback: boolean,
): boolean;
function readSettings(
  node: ModSetting | undefined,
  fallback: number | boolean,
): number | boolean {
  if (!node) {
    return fallback;
  }

  return node.value as number | boolean;
}

export function refreshConfig(): void {
  Config.movementModifier = readSettings(
    settings.startup[MovementModifierSetting],
    0.9,
  );
  Config.respawnKit = readSettings(settings.startup[RespawnKitSetting], true);
  Config.allowHelpMeJared = readSettings(
    settings.global[AllowHelpMeJaredSetting],
    false,
  );
}
