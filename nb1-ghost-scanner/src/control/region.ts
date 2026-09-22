/// <reference types="typed-factorio/runtime" />

import type { UnitNumber } from "factorio:runtime";
import { Config } from "../config.ts";
import { buildAreaRegions, buildNormalRegions } from "../regions.ts";
import {
  type AccumSignal,
  asFilterList,
  clearScanState,
  scanRegion,
} from "../scan.ts";
import type { ScannerRecord, ScanRegion, Storage } from "../types.ts";
import {
  clearCombinator,
  getScannerBehavior,
  writeCombinator,
} from "./combinator.ts";

declare const storage: Storage;

const buildRegionsFor = (record: ScannerRecord): ScanRegion[] =>
  record.mode === "normal"
    ? buildNormalRegions(record.entity)
    : buildAreaRegions(record);

export function enqueueScan(record: ScannerRecord): void {
  if (storage.scanRegions.has(record.id)) {
    return;
  }

  const behavior = getScannerBehavior(record.entity);

  if (!behavior) {
    return;
  }
  if (!behavior.enabled) {
    clearCombinator(behavior);
    clearScanState(record.id);

    return;
  }

  const regions = buildRegionsFor(record);

  storage.scanSignals.delete(record.id);
  storage.signalIndexes.delete(record.id);
  storage.foundEntities.delete(record.id);

  if (regions.length === 0) {
    clearCombinator(behavior);
    clearScanState(record.id);

    return;
  }

  storage.scanRegions.set(record.id, regions);
}

const scanAccumFor = (id: UnitNumber): AccumSignal[] | undefined =>
  storage.scanSignals.get(id) as unknown as AccumSignal[] | undefined;

function rememberScanAccum(id: UnitNumber, accum: AccumSignal[]): void {
  storage.scanSignals.set(id, asFilterList(accum));
}

export function drainScanQueue(): void {
  let budget = Config.scanCellsPerTick;
  const ids: UnitNumber[] = [];

  for (const [id] of storage.scanRegions) {
    ids.push(id);
  }

  for (const id of ids) {
    if (budget <= 0) {
      break;
    }

    const regions = storage.scanRegions.get(id);

    if (!regions) {
      continue;
    }

    const record = storage.scanners.get(id);

    if (!record || !record.entity.valid) {
      storage.scanRegions.delete(id);
      clearScanState(id);

      continue;
    }

    let accum = scanAccumFor(id);
    const remaining: typeof regions = [];

    for (let i = 0; i < regions.length; ++i) {
      const region = regions[i];

      if (budget <= 0) {
        for (let j = i; j < regions.length; ++j) {
          remaining.push(regions[j]);
        }

        break;
      }

      accum = scanRegion(id, region, accum, record.filters);

      --budget;
    }

    rememberScanAccum(id, accum ?? []);

    if (remaining.length > 0) {
      storage.scanRegions.set(id, remaining);

      break;
    }

    const behavior = getScannerBehavior(record.entity);

    if (behavior) {
      writeCombinator(behavior, asFilterList(accum ?? []));
    }

    storage.scanRegions.delete(id);
    storage.foundEntities.delete(id);
  }
}
