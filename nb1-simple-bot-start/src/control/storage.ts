import type { PlayerIndex } from "factorio:runtime";
import type { SpeedBonus, Storage } from "../types.ts";

declare const storage: Storage;

export function initStorage(): void {
  storage.equippedPlayers ??= new LuaSet<PlayerIndex>();
  storage.speedBonuses ??= new LuaMap<PlayerIndex, SpeedBonus>();
}
