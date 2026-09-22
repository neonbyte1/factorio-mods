/// <reference types="typed-factorio/runtime" />

import { refreshConfig } from "./config.ts";
import {
  onPlayerCursorStackChanged,
  onPlayerSelectedArea,
} from "./control/area.ts";
import {
  onGuiCheckedStateChanged,
  onGuiClick,
  onGuiClosed,
  onGuiOpened,
} from "./control/gui_events.ts";
import { onEntityCreated, onEntityRemoved } from "./control/scanner.ts";
import { onSelectedEntityChanged } from "./control/selection.ts";
import { onSettingChanged } from "./control/settings.ts";
import { initStorage, runInitialWorldScan } from "./control/storage.ts";
import { onTick } from "./control/tick.ts";

function initStaticEvents(): void {
  script.on_event(defines.events.on_built_entity, onEntityCreated);
  script.on_event(defines.events.on_robot_built_entity, onEntityCreated);
  script.on_event(defines.events.script_raised_built, onEntityCreated);
  script.on_event(defines.events.script_raised_revive, onEntityCreated);

  script.on_event(defines.events.on_pre_player_mined_item, onEntityRemoved);
  script.on_event(defines.events.on_robot_pre_mined, onEntityRemoved);
  script.on_event(defines.events.on_entity_died, onEntityRemoved);

  script.on_event(defines.events.on_tick, onTick);

  script.on_event(defines.events.on_gui_opened, onGuiOpened);
  script.on_event(defines.events.on_gui_closed, onGuiClosed);
  script.on_event(defines.events.on_gui_click, onGuiClick);
  script.on_event(
    defines.events.on_gui_checked_state_changed,
    onGuiCheckedStateChanged,
  );

  script.on_event(defines.events.on_player_selected_area, onPlayerSelectedArea);
  script.on_event(
    defines.events.on_player_cursor_stack_changed,
    onPlayerCursorStackChanged,
  );
  script.on_event(
    defines.events.on_selected_entity_changed,
    onSelectedEntityChanged,
  );

  script.on_event(
    defines.events.on_runtime_mod_setting_changed,
    onSettingChanged,
  );
}

script.on_init(() => {
  initStorage();
  refreshConfig();
  runInitialWorldScan();
  initStaticEvents();
});

script.on_load(() => {
  refreshConfig();
  initStaticEvents();
});

script.on_configuration_changed(() => {
  initStorage();
  refreshConfig();
  runInitialWorldScan();
  initStaticEvents();
});
