# @triplex/api

> This package is an experiment. Found it useful? Give feedback in the [Triplex Discord community](https://discord.gg/nBzRBUEs4b).

## Installation

Use your favorite package manager to install.

```bash
npm i @triplex/api
```

Update your `tsconfig.json` / `jsconfig.json` to inject global Triplex types.

```json
{
  "compilerOptions": {
    "types": ["@triplex/api/types"]
  }
}
```

## Usage

### Global Triplex API

#### `window.triplex.debug(channel, data)`

Log data to the Triplex debug panel call it whenever you want, even in frame loops. Any serializable data can be passed in the data argument.

```js
window.triplex?.debug("players", 2);
```

### Koota

Helpers for [Koota](https://github.com/pmndrs/koota) that make it easier to use with Triplex.

#### `createSystem(system, args)`

Creates an ECS systems to be used in conjunction with `injectSystems`.

#### `injectSystems(component, args)`

Higher-order component that injects the [canvas provider](https://triplex.dev/docs/building-your-scene/providers#canvas-provider) with systems created from `createSystem`.

These systems are:

1. Added to the frame loop and automatically run when inside Triplex.
1. Added to provider input controls enabling you to run / pause them as needed.
