/// <reference types="typed-factorio/runtime" />

import type {
  LuaPlayer,
  OnPlayerRemovedEvent,
  OnPlayerRespawnedEvent,
  PlayerIndex,
} from "factorio:runtime";
import { Config } from "../config.ts";
import {
  ArmorItemName,
  RoboportEquipmentName,
  RoboportPositions,
  RobotCount,
  RobotItemName,
} from "../names.ts";
import type { Storage } from "../types.ts";
import { refreshSpeedBonus } from "./speed.ts";

declare const storage: Storage;

export function giveRobots(player: LuaPlayer): void {
  const target = player.character ?? player;
  const inserted = target.insert({ name: RobotItemName, count: RobotCount });

  if (inserted < RobotCount) {
    player.physical_surface.spill_item_stack({
      position: player.physical_position,
      stack: { name: RobotItemName, count: RobotCount - inserted },
      enable_looted: true,
      allow_belts: false,
    });
  }
}

export function equipPlayer(player: LuaPlayer): void {
  if (storage.equippedPlayers.has(player.index)) {
    return;
  }

  const character = player.character;

  if (!character) {
    return;
  }

  const inventory = character.get_inventory(
    defines.inventory.character_armor,
  );

  if (
    !inventory || !inventory.is_empty() ||
    inventory.insert({ name: ArmorItemName }) === 0
  ) {
    return;
  }

  const grid = inventory[0].grid;

  if (grid) {
    for (const position of RoboportPositions) {
      const equipment = grid.put({ name: RoboportEquipmentName, position });

      if (equipment) {
        equipment.energy = equipment.max_energy;
      }
    }
  }

  storage.equippedPlayers.add(player.index);

  giveRobots(player);
  refreshSpeedBonus(player);
}

export function onPlayerNeedsKit(event: { player_index: PlayerIndex }): void {
  const player = game.get_player(event.player_index);

  if (player) {
    equipPlayer(player);
  }
}

export function onPlayerRespawned(event: OnPlayerRespawnedEvent): void {
  const player = game.get_player(event.player_index);

  if (!player) {
    return;
  }

  if (Config.respawnKit) {
    storage.equippedPlayers.delete(player.index);
  }

  equipPlayer(player);
}

export function onPlayerRemoved(event: OnPlayerRemovedEvent): void {
  storage.equippedPlayers.delete(event.player_index);
  storage.speedBonuses.delete(event.player_index);
}
