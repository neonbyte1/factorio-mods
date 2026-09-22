/// <reference types="typed-factorio/runtime" />

import type { PlayerIndex, UnitNumber } from "factorio:runtime";

export interface SpeedBonus {
  unit: UnitNumber;
  value: number;
}

export interface Storage {
  equippedPlayers: LuaSet<PlayerIndex>;
  speedBonuses: LuaMap<PlayerIndex, SpeedBonus>;
}
