<p align="center">
  <img src="https://i.imgur.com/DKVoVSE.png" alt="Header" /></a>
</p>

<p align="center">My mods for Factorio 2.1. They are written in TypeScript and transpiled to Lua with <a target="_blank" href="https://typescripttolua.github.io/"><code>TypeScriptToLua</code></a>.</p>

<p align="center">
  <a href="https://factorio.com/"><img src="https://img.shields.io/badge/Factorio-≥2.1-orange" alt="Factorio" /></a>
  <a href="https://www.deno.com/"><img src="https://img.shields.io/badge/deno-≥2.9-70ffaf?logo=deno" alt="TypeScript" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-≥5.6-blue?logo=typescript" alt="TypeScript" /></a>
</p>

## Mods

- [Ghost Scanner](nb1-ghost-scanner) is a combinator that turns construction
  ghosts into circuit signals, so your factory can supply its own building
  sites.
- [Simple Bot Start](nb1-simple-bot-start) starts every player with power armor,
  two roboports and 50 fast construction robots.

## Building

> [!IMPORTANT]
> You need [Deno](https://deno.com) instead of NodeJS.

```sh
deno install
deno task build
```

The `deno task pack` command builds a zip **for each** mod in its `build`
folder. Drop it into your Factorio mods folder and you're good to go. Both tasks
also work inside a single mod folder if you only care about that one.

## License

The repository is [MIT](LICENSE) licensed.
