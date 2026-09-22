/// <reference types="typed-factorio/runtime" />

import type {
  LuaEntity,
  LuaPlayer,
  OnPlayerArmorInventoryChangedEvent,
} from "factorio:runtime";
import { Config } from "../config.ts";
import { ArmorItemName } from "../names.ts";
import type { Storage } from "../types.ts";

declare const storage: Storage;

function isWearingArmor(character: LuaEntity): boolean {
  const inventory = character.get_inventory(
    defines.inventory.character_armor,
  );

  if (!inventory || inventory.is_empty()) {
    return false;
  }

  const stack = inventory[0];

  return stack.valid_for_read && stack.name === ArmorItemName;
}

export function refreshSpeedBonus(player: LuaPlayer): void {
  const character = player.character;

  if (!character || character.unit_number === undefined) {
    return;
  }

  const unit = character.unit_number;
  const previous = storage.speedBonuses.get(player.index);
  const applied = previous?.unit === unit ? previous.value : 0;
  const target = isWearingArmor(character) ? Config.movementModifier : 0;

  if (applied === target) {
    return;
  }

  character.character_running_speed_modifier += target - applied;

  if (target === 0) {
    storage.speedBonuses.delete(player.index);
  } else {
    storage.speedBonuses.set(player.index, { unit, value: target });
  }
}

export function onPlayerArmorInventoryChanged(
  event: OnPlayerArmorInventoryChangedEvent,
): void {
  const player = game.get_player(event.player_index);

  if (player) {
    refreshSpeedBonus(player);
  }
}
