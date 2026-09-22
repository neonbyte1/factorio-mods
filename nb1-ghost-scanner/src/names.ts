// String identifiers shared between data-stage prototypes and the control
// stage. Keep dependency-free.

export const ModName = "nb1-ghost-scanner";

export const ScannerEntityName = ModName;
export const ScannerItemName = ModName;
export const ScannerRecipeName = ModName;
export const AreaSelectorItemName = `${ModName}-area-selector`;

export const ItemOrder = `c[combinators]-e[${ModName}]`;
export const AreaSelectorOrder = `z[${AreaSelectorItemName}]`;

export const AssetPrefix = `__${ModName}__`;

export const IconPath = `${AssetPrefix}/graphics/icons/ghost-scanner.png`;
export const EntitySpritePath =
  `${AssetPrefix}/graphics/entity/hr-ghost-scanner.png`;
export const ProtoNotFoundError =
  `${ModName}: base constant-combinator prototype not found`;

// GUI element name prefix. Avoid collisions with other mods.
export const GuiPrefix = "nb1gs";

export const GuiNames = {
  frame: `${GuiPrefix}-frame`,
  close: `${GuiPrefix}-close`,
  enabled: `${GuiPrefix}-enabled`,
  modeNormal: `${GuiPrefix}-mode-normal`,
  modeArea: `${GuiPrefix}-mode-area`,
  areaSelect: `${GuiPrefix}-area-select`,
  areaClear: `${GuiPrefix}-area-clear`,
  areaLabel: `${GuiPrefix}-area-label`,
  statusLabel: `${GuiPrefix}-status-label`,
  areaFlow: `${GuiPrefix}-area-flow`,
  filterEntityGhosts: `${GuiPrefix}-filter-entity-ghosts`,
  filterTileGhosts: `${GuiPrefix}-filter-tile-ghosts`,
  filterGhostModules: `${GuiPrefix}-filter-ghost-modules`,
  filterEntityModules: `${GuiPrefix}-filter-entity-modules`,
  filterUpgrades: `${GuiPrefix}-filter-upgrades`,
  filterCliffs: `${GuiPrefix}-filter-cliffs`,
} as const;

export const TagKeys = {
  scanner: `${GuiPrefix}_scanner`,
  mode: `${GuiPrefix}_mode`,
  filter: `${GuiPrefix}_filter`,
} as const;

export const LocaleKeys = {
  guiTitle: `${ModName}.gui-title`,
  enabled: `${ModName}.enabled`,
  enabledTooltip: `${ModName}.enabled-tooltip`,
  modeLabel: `${ModName}.mode-label`,
  modeNormal: `${ModName}.mode-normal`,
  modeNormalTooltip: `${ModName}.mode-normal-tooltip`,
  modeArea: `${ModName}.mode-area`,
  modeAreaTooltip: `${ModName}.mode-area-tooltip`,
  areaNone: `${ModName}.area-none`,
  areaSet: `${ModName}.area-set`,
  areaButton: `${ModName}.area-button`,
  areaButtonTooltip: `${ModName}.area-button-tooltip`,
  areaCancel: `${ModName}.area-cancel`,
  close: `${ModName}.close`,
  statusNormalNoNetwork: `${ModName}.status-normal-no-network`,
  statusAreaNoBounds: `${ModName}.status-area-no-bounds`,
  filtersLabel: `${ModName}.filters-label`,
  filterEntityGhosts: `${ModName}.filter-entity-ghosts`,
  filterEntityGhostsTooltip: `${ModName}.filter-entity-ghosts-tooltip`,
  filterTileGhosts: `${ModName}.filter-tile-ghosts`,
  filterTileGhostsTooltip: `${ModName}.filter-tile-ghosts-tooltip`,
  filterGhostModules: `${ModName}.filter-ghost-modules`,
  filterGhostModulesTooltip: `${ModName}.filter-ghost-modules-tooltip`,
  filterEntityModules: `${ModName}.filter-entity-modules`,
  filterEntityModulesTooltip: `${ModName}.filter-entity-modules-tooltip`,
  filterUpgrades: `${ModName}.filter-upgrades`,
  filterUpgradesTooltip: `${ModName}.filter-upgrades-tooltip`,
  filterCliffs: `${ModName}.filter-cliffs`,
  filterCliffsTooltip: `${ModName}.filter-cliffs-tooltip`,
} as const;
