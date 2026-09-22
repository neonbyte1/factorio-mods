/// <reference types="typed-factorio/prototype" />

import type {
  ConstantCombinatorPrototype,
  ItemPrototype,
  RecipePrototype,
  SelectionToolPrototype,
  Sprite,
  Sprite4Way,
} from "factorio:prototype";
import { by_pixel, table } from "util";
import {
  AreaSelectorItemName,
  AreaSelectorOrder,
  EntitySpritePath,
  IconPath,
  ItemOrder,
  ProtoNotFoundError,
  ScannerEntityName,
  ScannerItemName,
  ScannerRecipeName,
} from "./names.ts";

declare function make_4way_animation_from_spritesheet(
  input: unknown,
): Sprite4Way;

const baseCombinator = data.raw["constant-combinator"]["constant-combinator"];

if (!baseCombinator) {
  error(ProtoNotFoundError);
}

const scannerEntity = table.deepcopy(
  baseCombinator,
) as ConstantCombinatorPrototype;

scannerEntity.name = ScannerEntityName;
scannerEntity.icon = IconPath;
scannerEntity.icon_size = 32;
scannerEntity.icons = undefined;

if (scannerEntity.minable) {
  scannerEntity.minable.result = ScannerItemName;
}

scannerEntity.sprites = make_4way_animation_from_spritesheet({
  layers: [
    {
      scale: 0.5,
      filename: EntitySpritePath,
      width: 114,
      height: 102,
      frame_count: 1,
      shift: by_pixel(0, 5),
    },
    {
      scale: 0.5,
      filename:
        "__base__/graphics/entity/combinator/constant-combinator-shadow.png",
      width: 98,
      height: 66,
      frame_count: 1,
      shift: by_pixel(8.5, 5.5),
      draw_as_shadow: true,
    },
  ],
});

const scannerItem: ItemPrototype = {
  type: "item",
  name: ScannerItemName,
  place_result: ScannerEntityName,
  icon: IconPath,
  icon_size: 32,
  subgroup: "circuit-network",
  order: ItemOrder,
  stack_size: 50,
  flags: ["draw-logistic-overlay"],
};

const scannerRecipe: RecipePrototype = {
  type: "recipe",
  name: ScannerRecipeName,
  icon: IconPath,
  icon_size: 32,
  enabled: false,
  energy_required: 0.5,
  ingredients: [
    { type: "item", name: "copper-cable", amount: 5 },
    { type: "item", name: "electronic-circuit", amount: 5 },
  ],
  results: [{ type: "item", name: ScannerItemName, amount: 1 }],
};

const areaSelectorIcon: Sprite = {
  filename: "__base__/graphics/icons/blueprint.png",
  size: 64,
  scale: 0.5,
  mipmap_count: 4,
};

const areaSelector: SelectionToolPrototype = {
  type: "selection-tool",
  name: AreaSelectorItemName,
  icons: [
    {
      icon: areaSelectorIcon.filename!,
      icon_size: 64,
      tint: { r: 1.0, g: 0.8, b: 0.2, a: 1.0 },
    },
  ],
  stack_size: 1,
  flags: ["only-in-cursor", "not-stackable", "spawnable"],
  hidden: true,
  subgroup: "tool",
  order: AreaSelectorOrder,
  draw_label_for_cursor_render: true,
  select: {
    border_color: { r: 1.0, g: 0.8, b: 0.2 },
    cursor_box_type: "entity",
    mode: ["any-entity", "any-tile"],
  },
  alt_select: {
    border_color: { r: 1.0, g: 0.6, b: 0.1 },
    cursor_box_type: "entity",
    mode: ["any-entity", "any-tile"],
  },
};

data.extend([scannerEntity, scannerItem, scannerRecipe, areaSelector]);

const advancedCombinators = data.raw["technology"]["advanced-combinators"];

if (advancedCombinators) {
  const effects = [...(advancedCombinators.effects ?? [])];

  effects.push({ type: "unlock-recipe", recipe: ScannerRecipeName });

  advancedCombinators.effects = effects;
}
