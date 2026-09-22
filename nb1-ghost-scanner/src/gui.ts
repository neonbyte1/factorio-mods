/// <reference types="typed-factorio/runtime" />

import type {
  LocalisedString,
  LuaGuiElement,
  LuaPlayer,
  PlayerIndex,
  UnitNumber,
} from "factorio:runtime";
import { clearCombinator, getScannerBehavior } from "./control/combinator.ts";
import {
  AreaSelectorItemName,
  GuiNames,
  LocaleKeys,
  TagKeys,
} from "./names.ts";
import { drawOverlayFor } from "./overlay.ts";
import { clearScanState } from "./scan.ts";
import type { FilterKey, ScanMode, ScannerRecord, Storage } from "./types.ts";

declare const storage: Storage;

interface GuiTag {
  scannerId: number;
  mode?: ScanMode;
  filter?: FilterKey;
}

interface FilterMeta {
  key: FilterKey;
  name: string;
  caption: string;
  tooltip: string;
}

const FilterList: readonly FilterMeta[] = [
  {
    key: "entityGhosts",
    name: GuiNames.filterEntityGhosts,
    caption: LocaleKeys.filterEntityGhosts,
    tooltip: LocaleKeys.filterEntityGhostsTooltip,
  },
  {
    key: "tileGhosts",
    name: GuiNames.filterTileGhosts,
    caption: LocaleKeys.filterTileGhosts,
    tooltip: LocaleKeys.filterTileGhostsTooltip,
  },
  {
    key: "ghostModules",
    name: GuiNames.filterGhostModules,
    caption: LocaleKeys.filterGhostModules,
    tooltip: LocaleKeys.filterGhostModulesTooltip,
  },
  {
    key: "entityModules",
    name: GuiNames.filterEntityModules,
    caption: LocaleKeys.filterEntityModules,
    tooltip: LocaleKeys.filterEntityModulesTooltip,
  },
  {
    key: "upgrades",
    name: GuiNames.filterUpgrades,
    caption: LocaleKeys.filterUpgrades,
    tooltip: LocaleKeys.filterUpgradesTooltip,
  },
  {
    key: "cliffs",
    name: GuiNames.filterCliffs,
    caption: LocaleKeys.filterCliffs,
    tooltip: LocaleKeys.filterCliffsTooltip,
  },
];

function asFilterKey(v: unknown): FilterKey | undefined {
  if (
    v === "entityGhosts" || v === "tileGhosts" || v === "ghostModules" ||
    v === "entityModules" || v === "upgrades" || v === "cliffs"
  ) {
    return v;
  }

  return undefined;
}

function asGuiTag(
  tags: Record<string, unknown> | undefined,
): GuiTag | undefined {
  if (tags) {
    const scannerVal = tags[TagKeys.scanner];

    if (typeof scannerVal === "number") {
      const modeVal = tags[TagKeys.mode];
      const mode = modeVal === "normal" || modeVal === "area"
        ? modeVal
        : undefined;
      const filter = asFilterKey(tags[TagKeys.filter]);

      return { scannerId: scannerVal, mode, filter };
    }
  }

  return undefined;
}

function areaSummary(record: ScannerRecord): LocalisedString {
  const area = record.area;

  if (!area) {
    return [LocaleKeys.areaNone];
  }

  const x = math.floor(area.left_top.x);
  const y = math.floor(area.left_top.y);
  const w = math.floor(area.right_bottom.x - area.left_top.x);
  const h = math.floor(area.right_bottom.y - area.left_top.y);
  return [
    LocaleKeys.areaSet,
    string.format("%d", x),
    string.format("%d", y),
    string.format("%d", w),
    string.format("%d", h),
  ];
}

function buildAreaFlow(
  parent: LuaGuiElement,
  record: ScannerRecord,
): void {
  const flow = parent.add({
    type: "flow",
    name: GuiNames.areaFlow,
    direction: "vertical",
  });

  flow.add({
    type: "label",
    name: GuiNames.areaLabel,
    caption: areaSummary(record),
  });

  const buttons = flow.add({ type: "flow", direction: "horizontal" });

  buttons.add({
    type: "button",
    name: GuiNames.areaSelect,
    caption: [LocaleKeys.areaButton],
    tooltip: [LocaleKeys.areaButtonTooltip],
    tags: { [TagKeys.scanner]: record.id },
  });

  if (record.area) {
    buttons.add({
      type: "button",
      name: GuiNames.areaClear,
      caption: [LocaleKeys.areaCancel],
      tags: { [TagKeys.scanner]: record.id },
    });
  }
}

function buildFiltersFlow(
  parent: LuaGuiElement,
  record: ScannerRecord,
): void {
  const label = parent.add({
    type: "label",
    caption: [LocaleKeys.filtersLabel],
  });
  label.style.font = "default-semibold";

  const flow = parent.add({ type: "flow", direction: "vertical" });

  for (const meta of FilterList) {
    flow.add({
      type: "checkbox",
      name: meta.name,
      caption: [meta.caption],
      tooltip: [meta.tooltip],
      state: record.filters[meta.key],
      tags: {
        [TagKeys.scanner]: record.id,
        [TagKeys.filter]: meta.key,
      },
    });
  }
}

export function closeGui(player: LuaPlayer): void {
  const existing = player.gui.screen[GuiNames.frame];

  if (existing) {
    existing.destroy();
  }

  storage.guiOpen.delete(player.index);
}

export function openGui(
  player: LuaPlayer,
  record: ScannerRecord,
): void {
  closeGui(player);

  const frame = player.gui.screen.add({
    type: "frame",
    name: GuiNames.frame,
    direction: "vertical",
    caption: [LocaleKeys.guiTitle],
    tags: { [TagKeys.scanner]: record.id },
  });

  frame.auto_center = true;
  player.opened = frame;

  const behavior = getScannerBehavior(record.entity);

  frame.add({
    type: "checkbox",
    name: GuiNames.enabled,
    caption: [LocaleKeys.enabled],
    tooltip: [LocaleKeys.enabledTooltip],
    state: behavior?.enabled ?? true,
    tags: { [TagKeys.scanner]: record.id },
  });

  frame.add({ type: "line", direction: "horizontal" });

  const modeLabel = frame.add({
    type: "label",
    caption: [LocaleKeys.modeLabel],
  });
  modeLabel.style.font = "default-semibold";

  const modeFlow = frame.add({ type: "flow", direction: "vertical" });
  const addMode = (
    mode: ScanMode,
    name: string,
    caption: string,
    tooltip: string,
  ) => {
    modeFlow.add({
      type: "radiobutton",
      name,
      caption: [caption],
      tooltip: [tooltip],
      state: record.mode === mode,
      tags: { [TagKeys.scanner]: record.id, [TagKeys.mode]: mode },
    });
  };

  addMode(
    "normal",
    GuiNames.modeNormal,
    LocaleKeys.modeNormal,
    LocaleKeys.modeNormalTooltip,
  );

  addMode(
    "area",
    GuiNames.modeArea,
    LocaleKeys.modeArea,
    LocaleKeys.modeAreaTooltip,
  );

  if (record.mode === "area") {
    frame.add({ type: "line", direction: "horizontal" });

    buildAreaFlow(frame, record);
  }

  frame.add({ type: "line", direction: "horizontal" });

  buildFiltersFlow(frame, record);

  frame.add({
    type: "label",
    name: GuiNames.statusLabel,
    caption: record.mode === "normal"
      ? [LocaleKeys.statusNormalNoNetwork]
      : (record.area ? "" : [LocaleKeys.statusAreaNoBounds]),
  });

  const footer = frame.add({ type: "flow", direction: "horizontal" });
  const spacer = footer.add({ type: "empty-widget" });

  spacer.style.horizontally_stretchable = true;

  footer.add({
    type: "button",
    name: GuiNames.close,
    caption: [LocaleKeys.close],
    tags: { [TagKeys.scanner]: record.id },
  });

  storage.guiOpen.set(player.index, record.id);
  drawOverlayFor(player, record);
}

function setMode(record: ScannerRecord, mode: ScanMode): void {
  if (record.mode !== mode) {
    record.mode = mode;

    clearScanState(record.id);
  }
}

function setEnabled(record: ScannerRecord, enabled: boolean): void {
  const behavior = getScannerBehavior(record.entity);

  if (!behavior || behavior.enabled === enabled) {
    return;
  }

  behavior.enabled = enabled;

  if (!enabled) {
    clearCombinator(behavior);
  }

  clearScanState(record.id);
}

function setFilter(
  record: ScannerRecord,
  key: FilterKey,
  enabled: boolean,
): void {
  if (record.filters[key] !== enabled) {
    record.filters[key] = enabled;

    clearScanState(record.id);
  }
}

function refreshFrame(
  player: LuaPlayer,
  record: ScannerRecord,
): void {
  if (storage.guiOpen.get(player.index) === record.id) {
    openGui(player, record);
  } else {
    drawOverlayFor(player, record);
  }
}

function startAreaSelection(
  player: LuaPlayer,
  record: ScannerRecord,
): void {
  if (player.clear_cursor()) {
    const stack = player.cursor_stack;

    if (stack) {
      stack.set_stack({ name: AreaSelectorItemName, count: 1 });
      storage.playersAwaitingArea.set(player.index, record.id);
    }
  }
}

export function cancelAreaSelection(playerIndex: PlayerIndex): void {
  if (storage.playersAwaitingArea.has(playerIndex)) {
    storage.playersAwaitingArea.delete(playerIndex);

    const player = game.get_player(playerIndex);

    if (player) {
      const stack = player.cursor_stack;
      if (
        stack && stack.valid_for_read && stack.name === AreaSelectorItemName
      ) {
        stack.clear();
      }
    }
  }
}

export function handleGuiClick(
  element: LuaGuiElement,
  player: LuaPlayer,
): boolean {
  const tag = asGuiTag(element.tags);

  if (tag) {
    const record = storage.scanners.get(tag.scannerId as UnitNumber);

    if (record) {
      switch (element.name) {
        case GuiNames.close:
          closeGui(player);

          return true;

        case GuiNames.areaSelect:
          startAreaSelection(player, record);
          closeGui(player);

          return true;

        case GuiNames.areaClear:
          record.area = undefined;

          clearScanState(record.id);
          refreshFrame(player, record);

          return true;

        default:
          break;
      }
    }
  }

  return false;
}

export function handleGuiCheckedStateChanged(
  element: LuaGuiElement,
  player: LuaPlayer,
): boolean {
  const tag = asGuiTag(element.tags);

  if (!tag) {
    return false;
  }

  const record = storage.scanners.get(tag.scannerId as UnitNumber);

  if (!record) {
    return false;
  }

  if (tag.mode) {
    setMode(record, tag.mode);
    refreshFrame(player, record);

    return true;
  }

  if (tag.filter) {
    setFilter(record, tag.filter, element.state as boolean);

    return true;
  }

  if (element.name === GuiNames.enabled) {
    setEnabled(record, element.state as boolean);

    return true;
  }

  return false;
}
