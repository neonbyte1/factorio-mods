/// <reference types="typed-factorio/settings" />
import {
  AllowHelpMeJaredSetting,
  InventorySlotsSetting,
  MovementModifierSetting,
  RespawnKitSetting,
  RobotSpeedSetting,
} from "./setting_names.ts";

data.extend([
  {
    type: "double-setting",
    name: MovementModifierSetting,
    order: "aa",
    setting_type: "startup",
    default_value: 0.9,
    minimum_value: 0,
    maximum_value: 10,
  },
  {
    type: "int-setting",
    name: InventorySlotsSetting,
    order: "ab",
    setting_type: "startup",
    default_value: 30,
    minimum_value: 0,
    maximum_value: 1000,
  },
  {
    type: "double-setting",
    name: RobotSpeedSetting,
    order: "ac",
    setting_type: "startup",
    default_value: 5,
    minimum_value: 1,
    maximum_value: 100,
  },
  {
    type: "bool-setting",
    name: RespawnKitSetting,
    order: "ad",
    setting_type: "startup",
    default_value: true,
  },
  {
    type: "bool-setting",
    name: AllowHelpMeJaredSetting,
    order: "ba",
    setting_type: "runtime-global",
    default_value: false,
  },
]);
