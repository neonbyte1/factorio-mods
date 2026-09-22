/// <reference types="typed-factorio/runtime" />

import { refreshConfig } from "./config.ts";
import { onHelpMeJared } from "./control/command.ts";
import {
  equipPlayer,
  onPlayerNeedsKit,
  onPlayerRemoved,
  onPlayerRespawned,
} from "./control/kit.ts";
import { onSettingChanged } from "./control/settings.ts";
import {
  onPlayerArmorInventoryChanged,
  refreshSpeedBonus,
} from "./control/speed.ts";
import { initStorage } from "./control/storage.ts";
import { HelpMeJaredCommand, LocaleKeys } from "./names.ts";

function initStaticEvents(): void {
  script.on_event(defines.events.on_player_created, onPlayerNeedsKit);
  script.on_event(defines.events.on_player_respawned, onPlayerRespawned);
  script.on_event(
    defines.events.on_player_controller_changed,
    onPlayerNeedsKit,
  );
  script.on_event(defines.events.on_player_removed, onPlayerRemoved);

  script.on_event(
    defines.events.on_player_armor_inventory_changed,
    onPlayerArmorInventoryChanged,
  );

  script.on_event(
    defines.events.on_runtime_mod_setting_changed,
    onSettingChanged,
  );
}

commands.add_command(
  HelpMeJaredCommand,
  [LocaleKeys.helpMeJaredHelp],
  onHelpMeJared,
);

script.on_init(() => {
  initStorage();
  refreshConfig();
  initStaticEvents();

  for (const [, player] of game.players) {
    equipPlayer(player);
  }
});

script.on_load(() => {
  refreshConfig();
  initStaticEvents();
});

script.on_configuration_changed(() => {
  initStorage();
  refreshConfig();
  initStaticEvents();

  for (const [, player] of game.players) {
    refreshSpeedBonus(player);
  }
});
