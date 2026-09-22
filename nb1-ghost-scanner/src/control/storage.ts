import type { UnitNumber } from "factorio:runtime";
import { ScannerEntityName } from "../names.ts";
import type { ScannerRecord, Storage } from "../types.ts";
import { registerScanner } from "./scanner.ts";

declare const storage: Storage;

export function initStorage(): void {
  storage.initMod = storage.initMod ?? false;
  storage.scanners = storage.scanners ??
    new LuaMap<UnitNumber, ScannerRecord>();
  storage.scannerIds = storage.scannerIds ?? [];
  storage.scanRegions = new LuaMap();
  storage.scanSignals = new LuaMap();
  storage.signalIndexes = new LuaMap();
  storage.foundEntities = new LuaMap();
  storage.lookupItemsToPlaceThis = new LuaMap();
  storage.updateIndex = storage.updateIndex ?? 0;
  storage.updateTimeout = storage.updateTimeout ?? false;
  storage.playersAwaitingArea = storage.playersAwaitingArea ?? new LuaMap();
  storage.guiOpen = storage.guiOpen ?? new LuaMap();
  storage.overlays = storage.overlays ?? new LuaMap();

  for (const [, record] of storage.scanners) {
    record.filters = record.filters ?? {
      entityGhosts: true,
      tileGhosts: true,
      ghostModules: true,
      entityModules: true,
      upgrades: true,
      cliffs: true,
    };
  }
}

export function runInitialWorldScan(): void {
  if (storage.initMod) {
    return;
  }

  for (const [, surface] of game.surfaces) {
    const entities = surface.find_entities_filtered({
      name: ScannerEntityName,
    });

    for (const entity of entities) {
      registerScanner(entity);
    }
  }

  storage.initMod = true;
}
