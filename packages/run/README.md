# Triplex

[![Version](https://img.shields.io/npm/v/@triplex/run?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/@triplex/run)
[![Downloads](https://img.shields.io/npm/dt/@triplex/run.svg?style=flat&colorA=000000&colorB=000000)](https://npmjs.com/package/@triplex/run)
[![Discord](https://img.shields.io/discord/1077806513009197156?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=000000)](https://discord.gg/nBzRBUEs4b)

The [React Three Fiber](https://github.com/pmndrs/react-three-fiber) editor.

## Getting started

Triplex works with any bundler and framework such as Next.js or Remix.
Get started by running the init command then follow the prompts.

```sh
npx @triplex/run@latest init
```

## Config

Configure your Triplex project using the `config.json` file found in the `.triplex` folder.

| Option       | Type       | Default       | Description                                                                                         |
| ------------ | ---------- | ------------- | --------------------------------------------------------------------------------------------------- |
| `components` | `string[]` | `[]`          | Relative filepath globs used to mark component files that are able to be added to other components. |
| `files`      | `string[]` |               | Relative filepath globs used to mark component files that can be opened by the editor.              |
| `publicDir`  | `string`   | `"../public"` | Relative path to a folder which contains static assets such as gltf files.                          |

## Running the editor

To start run:

```sh
npx triplex editor
```

### Options

| Option                    | Default   | Description                                                 |
| ------------------------- | --------- | ----------------------------------------------------------- |
| `-E --export-name <name>` | `default` | Export to use when opening a file.                          |
| `-o --open [path]`        |           | Opens your default browser with an optional scene filepath. |
