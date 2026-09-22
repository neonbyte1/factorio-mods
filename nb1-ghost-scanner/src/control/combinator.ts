/// <reference types="typed-factorio/runtime" />

import type {
  LogisticFilterWrite,
  LuaConstantCombinatorControlBehavior,
  LuaEntity,
} from "factorio:runtime";

export const getScannerBehavior = (
  entity: LuaEntity,
): LuaConstantCombinatorControlBehavior | undefined =>
  entity.get_control_behavior() as
    | LuaConstantCombinatorControlBehavior
    | undefined;

export function clearCombinator(
  behavior: LuaConstantCombinatorControlBehavior,
): void {
  while (behavior.sections_count > 1) {
    behavior.remove_section(behavior.sections_count);
  }

  if (behavior.sections_count === 0) {
    behavior.add_section();
  }

  const section = behavior.get_section(1);

  if (section) {
    section.filters = [];
  }
}

export function writeCombinator(
  behavior: LuaConstantCombinatorControlBehavior,
  filters: LogisticFilterWrite[],
): void {
  clearCombinator(behavior);

  if (filters.length > 0) {
    const section = behavior.get_section(1);

    if (section) {
      section.filters = filters;
    }
  }
}
