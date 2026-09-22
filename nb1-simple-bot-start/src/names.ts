export const ModName = "nb1-simple-bot-start";

export const ArmorItemName = `${ModName}-armor`;
export const EquipmentGridName = `${ModName}-grid`;
export const RobotEntityName = `${ModName}-robot`;
export const RobotItemName = `${ModName}-robot`;

export const RoboportEquipmentName = "personal-roboport-mk2-equipment";
export const RoboportPositions = [
  { x: 0, y: 0 },
  { x: 2, y: 0 },
] as const;
export const RobotCount = 50;

export const HelpMeJaredCommand = "help-me-jared";

export const ProtoNotFoundError =
  `${ModName}: base power-armor-mk2 or construction-robot prototype not found`;

export const LocaleKeys = {
  helpMeJaredHelp: `${ModName}.help-me-jared-help`,
  helpMeJaredDisabled: `${ModName}.help-me-jared-disabled`,
} as const;
