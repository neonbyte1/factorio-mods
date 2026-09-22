/// <reference types="typed-factorio/runtime" />

import type {
  BoundingBox,
  LuaEntity,
  LuaLogisticNetwork,
} from "factorio:runtime";
import { squareRegion } from "./scan.ts";
import type { ScannerRecord, ScanRegion } from "./types.ts";

function regionsForCells(
  network: LuaLogisticNetwork,
): ScanRegion[] {
  const out: ScanRegion[] = [];

  for (const cell of network.cells) {
    if (!cell.valid || !cell.owner.valid) {
      continue;
    }

    const { bounds, innerBounds } = squareRegion(
      cell.owner.position,
      cell.construction_radius,
    );

    out.push({
      surface: cell.owner.surface,
      force: network.force,
      bounds,
      innerBounds,
    });
  }

  return out;
}

export function buildNormalRegions(
  scanner: LuaEntity,
): ScanRegion[] {
  const network = scanner.surface
    .find_logistic_network_by_position(
      scanner.position,
      scanner.force,
    );

  return network ? regionsForCells(network) : [];
}

export function buildAreaRegions(
  scanner: ScannerRecord,
): ScanRegion[] {
  const area = scanner.area;

  if (area) {
    const surface = scanner.entity.surface;

    if (surface?.valid) {
      const bounds: BoundingBox = {
        left_top: {
          x: area.left_top.x,
          y: area.left_top.y,
        },
        right_bottom: {
          x: area.right_bottom.x,
          y: area.right_bottom.y,
        },
      };
      const innerBounds: BoundingBox = {
        left_top: {
          x: area.left_top.x + 0.001,
          y: area.left_top.y + 0.001,
        },
        right_bottom: {
          x: area.right_bottom.x - 0.001,
          y: area.right_bottom.y - 0.001,
        },
      };

      return [{
        surface,
        force: scanner.entity.force,
        bounds,
        innerBounds,
      }];
    }
  }

  return [];
}
