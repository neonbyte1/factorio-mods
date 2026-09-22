# Simple Bot Start

Every player starts with **Jared's power armor** and **50 of Jared's construction robots**.

Multiplayer-safe port of [Jareds SimpleBot Start](https://mods.factorio.com/mod/JaredsSimpleBotStart).

- The armor provides no protection, but carries two fully charged personal roboports MK2 in a 4×2 grid, a movement speed bonus, and extra inventory slots.
- The robots need no power and fly faster than regular construction robots. Mining one returns Jared's robot.
- Each player receives the kit as soon as they have a character, and again on every respawn unless the startup setting is turned off.
- Rejoining or new players joining does not hand out another kit.

## Command

`/help-me-jared` gives you 50 of Jared's construction robots. Robots that do not fit into your inventory are dropped at your feet. Disabled unless the map setting allows it.

## Settings

Startup settings:

| Setting                    | Default | Description                                           |
| -------------------------- | ------- | ----------------------------------------------------- |
| Armor movement speed bonus | 0.9     | Running speed bonus while wearing the armor (+90%).   |
| Armor inventory slots      | 30      | Additional inventory slots while wearing the armor.   |
| Robot speed multiplier     | 5       | Robot speed relative to a regular construction robot. |
| Starter kit on respawn     | on      | Give a new kit on every respawn.                      |

Map settings:

| Setting              | Default | Description                          |
| -------------------- | ------- | ------------------------------------ |
| Allow /help-me-jared | off     | Allow players to use /help-me-jared. |

## Compatibility

This mod is based on [Jareds SimpleBot Start](https://mods.factorio.com/mod/JaredsSimpleBotStart) and cannot be enabled together.
