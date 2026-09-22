/// <reference types="typed-factorio/runtime" />

import type {
  BoundingBox,
  ItemStackDefinition,
  LogisticFilterWrite,
  LuaEntity,
  LuaForce,
  LuaSurface,
  MapPosition,
  PlayerIndex,
  UnitNumber,
} from "factorio:runtime";

export type ScanMode = "normal" | "area";

export type FilterKey =
  | "entityGhosts"
  | "tileGhosts"
  | "ghostModules"
  | "entityModules"
  | "upgrades"
  | "cliffs";

export type ScannerFilters = Record<FilterKey, boolean>;

export interface AreaBounds {
  left_top: MapPosition;
  right_bottom: MapPosition;
}

export interface ScannerRecord {
  id: UnitNumber;
  entity: LuaEntity;
  mode: ScanMode;
  area?: AreaBounds;
  filters: ScannerFilters;
}

export interface ScanRegion {
  surface: LuaSurface;
  force: LuaForce;
  bounds: BoundingBox;
  innerBounds: BoundingBox;
}

export type FoundUid = number | string | MapPosition;

export interface Storage {
  initMod: boolean;
  scanners: LuaMap<UnitNumber, ScannerRecord>;
  scannerIds: UnitNumber[]; // stable iteration order
  scanRegions: LuaMap<UnitNumber, ScanRegion[]>;
  scanSignals: LuaMap<UnitNumber, LogisticFilterWrite[]>;
  signalIndexes: LuaMap<UnitNumber, LuaMap<string, number>>;
  foundEntities: LuaMap<UnitNumber, LuaSet<FoundUid>>;
  lookupItemsToPlaceThis: LuaMap<string, ItemStackDefinition[]>;
  updateIndex: number;
  updateTimeout: boolean;
  playersAwaitingArea: LuaMap<PlayerIndex, UnitNumber>;
  guiOpen: LuaMap<PlayerIndex, UnitNumber>;
  overlays: LuaMap<PlayerIndex, number[]>;
}
