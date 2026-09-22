/// <reference types="typed-factorio/runtime" />

import type { CustomCommandData } from "factorio:runtime";
import { Config } from "../config.ts";
import { LocaleKeys } from "../names.ts";
import { giveRobots } from "./kit.ts";

export function onHelpMeJared(command: CustomCommandData): void {
  if (command.player_index === undefined) {
    return;
  }

  const player = game.get_player(command.player_index);

  if (!player) {
    return;
  }

  if (!Config.allowHelpMeJared) {
    player.print([LocaleKeys.helpMeJaredDisabled]);
    return;
  }

  giveRobots(player);
}
