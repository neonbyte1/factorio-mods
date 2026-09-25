/// <reference types="typed-factorio/runtime" />

import type { ScriptRaisedBuiltEvent } from "factorio:runtime";

// the mod gets deprecated, once SE changes its respawn.lua
// ```diff
// - Respawn.on_player_respawned_event = script.generate_event_name()
// + Respawn.on_player_respawned_event = util.get_custom_event("on_player_respawned")
// ```

const FarReachBonuses = [
  ["far-reach-build-distance-bonus", "character_build_distance_bonus"],
  ["far-reach-reach-distance-bonus", "character_reach_distance_bonus"],
  [
    "far-reach-resource-reach-distance-bonus",
    "character_resource_reach_distance_bonus",
  ],
  ["far-reach-item-drop-distance-bonus", "character_item_drop_distance_bonus"],
  [
    "far-reach-item-pickup-distance-bonus",
    "character_item_pickup_distance_bonus",
  ],
] as const;

function onScriptRaisedBuilt(event: ScriptRaisedBuiltEvent): void {
  const character = event.entity;

  if (!character.valid) {
    return;
  }

  for (const [setting, bonus] of FarReachBonuses) {
    character[bonus] = settings.global[setting].value as number;
  }
}

script.on_event(defines.events.script_raised_built, onScriptRaisedBuilt, [
  { filter: "type", type: "character" },
]);
