/// <reference types="typed-factorio/runtime" />

import type {
  BoundingBox,
  ItemStackDefinition,
  LogisticFilterWrite,
  LuaEntity,
  LuaEntityPrototype,
  LuaQualityPrototype,
  LuaTilePrototype,
  MapPosition,
  QualityID,
  SignalFilterWrite,
  UnitNumber,
} from "factorio:runtime";
import { Config } from "./config.ts";
import type { FoundUid, ScannerFilters, ScanRegion, Storage } from "./types.ts";

declare const storage: Storage;

interface AccumSignal {
  value: SignalFilterWrite;
  min: number;
  itemName: string;
  qualityName: string | undefined;
}

const isInBBox = (pos: MapPosition, area: BoundingBox): boolean => (
  pos.x >= area.left_top.x &&
  pos.x <= area.right_bottom.x &&
  pos.y >= area.left_top.y &&
  pos.y <= area.right_bottom.y
);

function getItemsToPlace(
  prototype: LuaEntityPrototype | LuaTilePrototype,
): ItemStackDefinition[] {
  const cached = storage.lookupItemsToPlaceThis.get(prototype.name);

  if (cached) {
    return cached;
  }

  const items = prototype.items_to_place_this ?? [];
  let toStore: ItemStackDefinition[];

  if (Config.showHidden) {
    toStore = items;
  } else {
    toStore = [];

    for (const v of items) {
      const item = v.name !== undefined ? prototypes.item[v.name] : undefined;

      if (item && !item.hidden) {
        toStore.push(v);
      }
    }
  }

  storage.lookupItemsToPlaceThis.set(prototype.name, toStore);

  return toStore;
}

const qualityToName = (quality: QualityID | undefined): string | undefined =>
  quality === undefined
    ? undefined
    : (typeof quality === "string"
      ? quality
      : (quality as LuaQualityPrototype).name);

let currentSignals: AccumSignal[] | undefined;

function addSignal(
  id: UnitNumber,
  name: string,
  count: number,
  quality: QualityID | undefined,
): void {
  const indexes = storage.signalIndexes.get(id)!;
  const list = currentSignals!;
  const qualityName = qualityToName(quality);
  const key = qualityName !== undefined ? `${name}\0${qualityName}` : name;

  const existingIdx = indexes.get(key);
  let entry: AccumSignal;

  if (existingIdx !== undefined && list[existingIdx]) {
    entry = list[existingIdx];
  } else {
    indexes.set(key, list.length);
    entry = {
      value: {
        comparator: "=",
        type: "item",
        name,
        quality,
      },
      min: 0,
      itemName: name,
      qualityName,
    };
    list.push(entry);
  }

  entry.min += Config.invertSign ? -count : count;
}

const asFilterList = (list: AccumSignal[]): LogisticFilterWrite[] =>
  list as unknown as LogisticFilterWrite[];

export function scanRegion(
  id: UnitNumber,
  region: ScanRegion,
  prev: AccumSignal[] | undefined,
  filters: ScannerFilters,
): AccumSignal[] {
  let foundEntities = storage.foundEntities.get(id);

  if (!foundEntities) {
    foundEntities = new LuaSet<FoundUid>();

    storage.foundEntities.set(id, foundEntities);
  }

  currentSignals = prev;

  if (!currentSignals) {
    currentSignals = [];
    storage.signalIndexes.set(id, new LuaMap<string, number>());
  } else if (!storage.signalIndexes.has(id)) {
    storage.signalIndexes.set(id, new LuaMap<string, number>());
  }

  if (!region.surface.valid) {
    return currentSignals;
  }

  const { surface, force, bounds, innerBounds } = region;
  const cap = Config.maxResults;

  let addedThisPass = 0;
  let remaining = cap;
  let entities: LuaEntity[];

  const consume = (): void => {
    if (cap !== undefined) {
      remaining = (remaining ?? cap) - addedThisPass;
    }
  };

  if (filters.cliffs && (remaining === undefined || remaining > 0)) {
    entities = surface.find_entities_filtered({
      area: innerBounds,
      limit: remaining,
      type: "cliff",
    });

    addedThisPass = 0;

    for (const e of entities) {
      const un = e.unit_number;
      const uid: FoundUid = un !== undefined ? un : e.position;
      const explosive = e.prototype.cliff_explosive_prototype;
      if (
        !foundEntities.has(uid) &&
        e.is_registered_for_deconstruction(force) &&
        explosive
      ) {
        foundEntities.add(uid);

        addSignal(id, explosive, 1, "normal");

        ++addedThisPass;
      }
    }

    consume();
  }

  if (filters.upgrades && (remaining === undefined || remaining > 0)) {
    entities = surface.find_entities_filtered({
      area: bounds,
      limit: remaining,
      to_be_upgraded: true,
      force,
    });

    addedThisPass = 0;

    for (const e of entities) {
      const un = e.unit_number;

      if (un === undefined) {
        continue;
      }

      const [upgradePrototype, upgradeQuality] = e.get_upgrade_target();

      if (
        (foundEntities.has(un) || !upgradePrototype) ||
        !isInBBox(e.position, bounds)
      ) {
        continue;
      }

      foundEntities.add(un);

      for (const itemStack of getItemsToPlace(upgradePrototype)) {
        const c = itemStack.count ?? 1;

        if (itemStack.name === undefined) {
          continue;
        }

        addSignal(id, itemStack.name, c, upgradeQuality);

        addedThisPass += c;
      }
    }

    consume();
  }

  if (
    (filters.entityGhosts || filters.ghostModules) &&
    (remaining === undefined || remaining > 0)
  ) {
    entities = surface.find_entities_filtered({
      area: bounds,
      type: "entity-ghost",
      force,
      limit: remaining,
    });

    addedThisPass = 0;

    for (const e of entities) {
      const un = e.unit_number;
      if (
        un === undefined || foundEntities.has(un) ||
        !isInBBox(e.position, bounds)
      ) {
        continue;
      }

      foundEntities.add(un);

      if (filters.entityGhosts) {
        for (const itemStack of getItemsToPlace(e.ghost_prototype)) {
          const c = itemStack.count ?? 1;

          if (itemStack.name === undefined) {
            continue;
          }

          addSignal(id, itemStack.name, c, e.quality);
          addedThisPass += c;
        }
      }

      if (filters.ghostModules) {
        for (const request of e.item_requests) {
          addSignal(
            id,
            request.name,
            request.count,
            prototypes.quality[request.quality],
          );

          addedThisPass += request.count;
        }
      }
    }

    consume();
  }

  if (filters.entityModules && (remaining === undefined || remaining > 0)) {
    entities = surface.find_entities_filtered({
      area: innerBounds,
      limit: remaining,
      type: "item-request-proxy",
      force,
    });

    addedThisPass = 0;

    for (const e of entities) {
      const [proxyUid] = script.register_on_object_destroyed(e);
      const uid: FoundUid = proxyUid;

      if (foundEntities.has(uid)) {
        continue;
      }

      foundEntities.add(uid);

      for (const request of e.item_requests) {
        addSignal(id, request.name, request.count, request.quality);

        addedThisPass += request.count;
      }
    }

    consume();
  }

  if (filters.tileGhosts && (remaining === undefined || remaining > 0)) {
    entities = surface.find_entities_filtered({
      area: innerBounds,
      limit: remaining,
      type: "tile-ghost",
      force,
    });

    addedThisPass = 0;

    for (const e of entities) {
      const pos = e.position;
      const uid: FoundUid = `t:${math.floor(pos.x)}:${math.floor(pos.y)}`;

      if (foundEntities.has(uid)) {
        continue;
      }

      foundEntities.add(uid);

      for (const itemStack of getItemsToPlace(e.ghost_prototype)) {
        const c = itemStack.count ?? 1;

        if (itemStack.name !== undefined) {
          addSignal(id, itemStack.name, c, e.quality);
          addedThisPass += c;
        }
      }
    }

    consume();
  }

  if (Config.roundToStack) {
    const round = Config.invertSign ? math.floor : math.ceil;

    for (const entry of currentSignals) {
      const proto = prototypes.item[entry.itemName];

      if (proto !== undefined) {
        const stackSize = proto.stack_size;
        entry.min = round(entry.min / stackSize) * stackSize;
      }
    }
  }

  return currentSignals;
}

export function clearScanState(id: UnitNumber): void {
  storage.scanSignals.delete(id);
  storage.signalIndexes.delete(id);
  storage.scanRegions.delete(id);
  storage.foundEntities.delete(id);
}

export const squareRegion = (
  centre: MapPosition,
  radius: number,
): { bounds: BoundingBox; innerBounds: BoundingBox } => {
  const bounds: BoundingBox = {
    left_top: {
      x: centre.x - radius,
      y: centre.y - radius,
    },
    right_bottom: {
      x: centre.x + radius,
      y: centre.y + radius,
    },
  };
  const innerBounds: BoundingBox = {
    left_top: {
      x: centre.x - radius + 0.001,
      y: centre.y - radius + 0.001,
    },
    right_bottom: {
      x: centre.x + radius - 0.001,
      y: centre.y + radius - 0.001,
    },
  };
  return { bounds, innerBounds };
};

export { asFilterList };
export type { AccumSignal };
