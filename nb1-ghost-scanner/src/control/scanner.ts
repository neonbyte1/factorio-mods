/// <reference types="typed-factorio/runtime" />

import type {
  LuaEntity,
  OnBuiltEntityEvent,
  OnEntityDiedEvent,
  OnPrePlayerMinedItemEvent,
  OnRobotBuiltEntityEvent,
  OnRobotPreMinedEvent,
  PlayerIndex,
  ScriptRaisedBuiltEvent,
  ScriptRaisedReviveEvent,
  UnitNumber,
} from "factorio:runtime";
import { cancelAreaSelection, closeGui } from "../gui.ts";
import { ScannerEntityName } from "../names.ts";
import { clearOverlay } from "../overlay.ts";
import { clearScanState } from "../scan.ts";
import type { ScannerRecord, Storage } from "../types.ts";

declare const storage: Storage;

export function registerScanner(entity: LuaEntity): void {
  if (entity.valid && entity.unit_number !== undefined) {
    const id = entity.unit_number!;

    if (!storage.scanners.has(id)) {
      entity.operable = true;

      const record: ScannerRecord = {
        id,
        entity,
        mode: "normal",
        filters: {
          entityGhosts: true,
          tileGhosts: true,
          ghostModules: true,
          entityModules: true,
          upgrades: true,
          cliffs: true,
        },
      };
      storage.scanners.set(id, record);
      storage.scannerIds.push(id);
    }
  }
}

export function unregisterScanner(id: UnitNumber): void {
  if (!storage.scanners.delete(id)) {
    return;
  }

  for (let i = storage.scannerIds.length - 1; i >= 0; --i) {
    if (storage.scannerIds[i] === id) {
      storage.scannerIds.splice(i, 1);

      break;
    }
  }

  clearScanState(id);

  const staleGui: PlayerIndex[] = [];

  for (const [playerIndex, scannerId] of storage.guiOpen) {
    if (scannerId === id) {
      staleGui.push(playerIndex);
    }
  }

  for (const playerIndex of staleGui) {
    const player = game.get_player(playerIndex);

    if (player) {
      closeGui(player);
    }
  }

  const staleAwait: PlayerIndex[] = [];

  for (const [playerIndex, scannerId] of storage.playersAwaitingArea) {
    if (scannerId === id) {
      staleAwait.push(playerIndex);
    }
  }

  for (const playerIndex of staleAwait) {
    cancelAreaSelection(playerIndex);
  }

  const staleOverlay: PlayerIndex[] = [];

  for (const [playerIndex] of storage.overlays) {
    staleOverlay.push(playerIndex);
  }

  for (const playerIndex of staleOverlay) {
    clearOverlay(playerIndex);
  }
}

export function onEntityCreated(
  event:
    | OnBuiltEntityEvent
    | OnRobotBuiltEntityEvent
    | ScriptRaisedBuiltEvent
    | ScriptRaisedReviveEvent,
): void {
  const entity = event.entity;

  if (entity?.valid && entity?.name === ScannerEntityName) {
    registerScanner(entity);
  }
}

export function onEntityRemoved(
  event: OnPrePlayerMinedItemEvent | OnRobotPreMinedEvent | OnEntityDiedEvent,
): void {
  const entity = event.entity;

  if (entity?.valid && entity?.name === ScannerEntityName) {
    const id = entity.unit_number;

    if (id !== undefined) {
      unregisterScanner(id);
    }
  }
}
