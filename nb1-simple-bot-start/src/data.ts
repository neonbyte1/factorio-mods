/// <reference types="typed-factorio/prototype" />

import type {
  ArmorPrototype,
  ConstructionRobotPrototype,
  EquipmentGridPrototype,
  ItemPrototype,
} from "factorio:prototype";
import { table } from "util";
import {
  ArmorItemName,
  EquipmentGridName,
  ProtoNotFoundError,
  RobotEntityName,
  RobotItemName,
} from "./names.ts";
import { InventorySlotsSetting, RobotSpeedSetting } from "./setting_names.ts";

const baseArmor = data.raw["armor"]["power-armor-mk2"];
const baseRobot = data.raw["construction-robot"]["construction-robot"];
const baseRobotItem = data.raw["item"]["construction-robot"];

if (!baseArmor || !baseRobot || !baseRobotItem) {
  error(ProtoNotFoundError);
}

const grid: EquipmentGridPrototype = {
  type: "equipment-grid",
  name: EquipmentGridName,
  width: 4,
  height: 2,
  equipment_categories: ["armor"],
};

const armor = table.deepcopy(baseArmor) as ArmorPrototype;

armor.name = ArmorItemName;
armor.icons = [
  { icon: baseArmor.icon!, tint: { r: 0.5, g: 0.5, b: 1, a: 1 } },
];
armor.resistances = [];
armor.equipment_grid = EquipmentGridName;
armor.inventory_size_bonus = settings.startup[InventorySlotsSetting]!
  .value as number;

const robotIcons = [
  { icon: baseRobot.icon!, tint: { r: 0.2, g: 0.2, b: 0.8, a: 1 } },
];

const robot = table.deepcopy(baseRobot) as ConstructionRobotPrototype;

robot.name = RobotEntityName;
robot.icons = robotIcons;
robot.max_energy = "0kJ";
robot.energy_per_move = "0J";
robot.energy_per_tick = "0W";
robot.speed = robot.speed *
  (settings.startup[RobotSpeedSetting]!.value as number);
robot.speed_multiplier_when_out_of_energy = 1;

if (robot.minable) {
  robot.minable.result = RobotItemName;
}

const robotItem = table.deepcopy(baseRobotItem) as ItemPrototype;

robotItem.name = RobotItemName;
robotItem.icons = robotIcons;
robotItem.place_result = RobotEntityName;

data.extend([grid, armor, robot, robotItem]);
