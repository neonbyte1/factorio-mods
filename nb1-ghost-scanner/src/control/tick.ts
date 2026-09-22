/// <reference types="typed-factorio/runtime" />

import type { OnTickEvent } from "factorio:runtime";
import { Config } from "../config.ts";
import type { Storage } from "../types.ts";
import { drainScanQueue, enqueueScan } from "./region.ts";

declare const storage: Storage;

export function onTick(event: OnTickEvent): void {
  if (event.tick % Config.updateInterval === 0) {
    storage.updateTimeout = false;
  }

  if (event.tick % Config.scanDelay !== 0) {
    return;
  }

  if (!storage.updateTimeout) {
    if (storage.updateIndex >= storage.scannerIds.length) {
      storage.updateIndex = 0;
      storage.updateTimeout = true;
    } else {
      const id = storage.scannerIds[storage.updateIndex];
      const record = storage.scanners.get(id);

      if (record) {
        enqueueScan(record);
      }

      ++storage.updateIndex;
    }
  }

  drainScanQueue();
}
