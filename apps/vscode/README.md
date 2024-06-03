# Triplex for Visual Studio Code (early access)

[![Discord](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fdiscord.com%2Fapi%2Finvites%2FnBzRBUEs4b%3Fwith_counts%3Dtrue&query=%24.approximate_member_count&style=flat&colorA=000000&colorB=000000&label=discord&logo=&logoColor=000000)](https://discord.gg/nBzRBUEs4b)
[![Downloads](https://img.shields.io/github/downloads/try-triplex/triplex/total?style=flat&colorA=000000&colorB=000000&label=downloads&logo=&logoColor=000000)](https://triplex.dev/download)
[![Version](https://img.shields.io/github/v/release/try-triplex/triplex?style=flat&colorA=000000&colorB=000000&label=latest&logo=&logoColor=000000)](https://github.com/try-triplex/triplex/releases)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/itsdouges?style=flat&colorA=000000&colorB=000000&label=sponsor&logo=&logoColor=000000)](https://github.com/sponsors/itsdouges)

This extension adds [Triplex](https://triplex.dev) support to VS Code. Triplex
is the [React Three Fiber](https://github.com/pmndrs/react-three-fiber) visual
IDE.

<p align="center">
  <img alt="image" src="https://github.com/try-triplex/triplex/assets/6801309/bf77374a-3eb0-4b1f-aa5a-9e84acb1a400">
</p>

## Installation

Search for "Triplex" in the VS Code extensions panel or install
[through the marketplace](https://marketplace.visualstudio.com/items?itemName=trytriplex.triplex-vsce).

## Set up

By default all React components can be opened by Triplex. When wanting to scope
it down you can create a `.triplex/config.json` file and populate the `"files"`
field.

Learn more in the
[project settings documentation](https://triplex.dev/docs/get-started/settings).

## Features

- CodeLens to open component functions
- Visual editor for React Three Fiber
- Undo/redo
- Save to source code
- Load from source code

## Commands

- `Open File`: Opens the focused file with Triplex.
- `Editor Camera`: Sets the camera when running the component to be the editors
  camera.
- `Default Camera`: Sets the camera when running the component to be the default
  camera.
