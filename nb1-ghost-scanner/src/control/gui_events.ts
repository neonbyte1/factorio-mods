/// <reference types="typed-factorio/runtime" />

import type {
  LuaEntity,
  LuaGuiElement,
  LuaPlayer,
  OnGuiCheckedStateChangedEvent,
  OnGuiClickEvent,
  OnGuiClosedEvent,
  OnGuiOpenedEvent,
} from "factorio:runtime";
import {
  closeGui,
  handleGuiCheckedStateChanged,
  handleGuiClick,
  openGui,
} from "../gui.ts";
import { GuiNames, ScannerEntityName } from "../names.ts";
import type { Storage } from "../types.ts";
import { refreshOverlayForPlayer } from "./selection.ts";

declare const storage: Storage;

interface OnGuiEventOptions {
  type: "element" | "entity";
  name?: string;
}

interface OnGuiEventCallbackParams {
  element?: LuaGuiElement;
  entity?: LuaEntity;
  player: LuaPlayer;
}

function onGuiEvent<
  T extends
    | OnGuiOpenedEvent
    | OnGuiClosedEvent
    | OnGuiClickEvent
    | OnGuiCheckedStateChangedEvent,
>(
  event: T,
  options: OnGuiEventOptions,
  callback: (opts: OnGuiEventCallbackParams) => unknown,
): void {
  const element = event.element;
  const entity: LuaEntity | undefined = "entity" in event
    ? event.entity
    : undefined;

  const source: LuaGuiElement | LuaEntity | undefined =
    options.type === "element" ? element : entity;

  if (
    !source || !source.valid ||
    (options.name !== undefined && source.name !== options.name)
  ) {
    return;
  }

  const player = game.get_player(event.player_index);

  if (player) {
    callback({ element, entity, player });
  }
}

export const onGuiOpened = (event: OnGuiOpenedEvent): void =>
  onGuiEvent(
    event,
    { type: "entity", name: ScannerEntityName },
    ({ player, entity }): void => {
      const record = storage.scanners.get(entity!.unit_number!);

      if (record) {
        player.opened = undefined;
        openGui(player, record);
      }
    },
  );

export const onGuiClosed = (event: OnGuiClosedEvent): void =>
  onGuiEvent(
    event,
    { type: "element", name: GuiNames.frame },
    ({ player }): void => {
      closeGui(player);
      refreshOverlayForPlayer(player);
    },
  );

export const onGuiClick = (event: OnGuiClickEvent): void =>
  onGuiEvent(
    event,
    { type: "element" },
    ({ element, player }): void => {
      handleGuiClick(element!, player);
    },
  );

export const onGuiCheckedStateChanged = (
  event: OnGuiCheckedStateChangedEvent,
): void =>
  onGuiEvent(
    event,
    { type: "element" },
    ({ element, player }): void => {
      handleGuiCheckedStateChanged(element!, player);
    },
  );
