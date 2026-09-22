/// <reference types="typed-factorio/runtime" />

import {
  AreaMaxSideSetting,
  AreasPerTickSetting,
  MaxResultsSetting,
  NegativeOutputSetting,
  RoundToStackSetting,
  ScanAreasDelaySetting,
  ShowHiddenSetting,
  UpdateIntervalSetting,
} from "./setting_names.ts";

export const Config = {
  scanCellsPerTick: 5,
  updateInterval: 180,
  scanDelay: 5,
  maxResults: 1000 as number | undefined,
  areaMaxSide: 512,
  showHidden: false,
  invertSign: false,
  roundToStack: false,
};

function readSettings(key: string, fallback: number): number;
function readSettings(key: string, fallback: boolean): boolean;
function readSettings(
  key: string,
  fallback: number | boolean,
): number | boolean {
  const node = settings.global[key];

  if (!node) {
    return fallback;
  }

  return node.value as number | boolean;
}

export function refreshConfig(): void {
  const mr = readSettings(MaxResultsSetting, 1000);

  Config.scanCellsPerTick = readSettings(AreasPerTickSetting, 5);
  Config.updateInterval = readSettings(UpdateIntervalSetting, 180);
  Config.scanDelay = readSettings(ScanAreasDelaySetting, 5);
  Config.maxResults = mr === 0 ? undefined : mr;
  Config.areaMaxSide = readSettings(AreaMaxSideSetting, 512);
  Config.showHidden = readSettings(ShowHiddenSetting, false);
  Config.invertSign = readSettings(NegativeOutputSetting, false);
  Config.roundToStack = readSettings(RoundToStackSetting, false);
}
