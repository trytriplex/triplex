# Contributing to Triplex

Thank you for considering a contribution to Triplex! Pull requests, issues and comments are welcome. Everything in Triplex is open source so dive into what you think would be fun to work on!

If you're looking for an issue to work on have a look for the "[Contribution ready](https://github.com/pmndrs/triplex/labels/Contribution%20ready)" labelled issues or reach out on the Poimandres [Discord community](https://discord.gg/SUHCwfEk).

## Set Up

1. Triplex uses [Volta](https://docs.volta.sh/guide/getting-started) and [corepack](https://nodejs.org/api/corepack.html) for managing Node.js and package manager versions so you'll need to install them first. They both automatically use the declared version of Node.js / package manager in the root package.json so you don't have to worry about it.

2. Install dependencies by running `pnpm`.

```bash
➜  pnpm i
Scope: all 38 workspace projects
Lockfile is up to date, resolution step is skipped
Already up to date
Done in 2s using pnpm v10.11.0
```

3. Install [Triplex for VS Code](https://triplex.dev/docs/get-started/vscode).

4. You're now ready to start developing!

## Developing With Triplex for VS Code

With either VS Code or Cursor open, go to the `/examples` folder, find a component, and click the "Open in Triplex" Code Lens action.

## Using Your Own Project

You can develop Triplex using your own projects instead of the example packages by updating their `.triplex/config.json` file to point to the renderer package in this repository.

Inside your project create or update the Triplex config to add the renderer property. It should point to the index file inside the renderer package in this repository. We recommend passing an absolute path.

```json
// .triplex/config.json
{
  "renderer": "/triplex/packages/renderer/src/index.tsx"
}
```
