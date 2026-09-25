# Far Reach SE Respawn Fix

Keeps [Far Reach](https://mods.factorio.com/mod/far-reach) bonuses after dying
with [Space Exploration](https://mods.factorio.com/mod/space-exploration),
without reconnecting.

- Space Exploration respawns you with a brand new character, and reach bonuses
  belong to the character, so the new one starts without them.
- Far Reach listens for Space Exploration's respawn event, but Space Exploration
  never raises the event it advertises. The bonuses only came back after
  reconnecting.
- This mod applies your Far Reach settings to every character created by a mod
  script, which includes the Space Exploration respawn.

No settings. Far Reach's map settings are used as-is.

## Compatibility

Requires [Far Reach](https://mods.factorio.com/mod/far-reach). Becomes redundant
once Space Exploration raises `se_on_player_respawned`, but keeps working
alongside that fix.
