<p align="center">
  <a href="#">
    <img width="128" height="128" src="https://user-images.githubusercontent.com/6801309/223384096-4972fb5d-3bdf-4ca8-b488-09260b76ce7e.png" />
  </a>
  <h1 align="center">Triplex</h1>
</p>

## Getting started

Triplex works standalone and with other frameworks like Next.js or Remix.
Start by initializing in a folder:

> **Note** - Starting fresh? Create a folder first.
>
> ```
> mkdir my-triplex-app
> cd my-triplex-app
> ```

```sh
npx @triplex/run@latest init
```

Then follow the prompts.

### Config

Configure your Triplex project using the `config.json` file found in the `.triplex` folder.

| Option      | Type       | Default       | Description                                                                  |
| ----------- | ---------- | ------------- | ---------------------------------------------------------------------------- |
| `files`     | `string[]` |               | Relative filepath globs used to mark files that can be opened by the editor. |
| `publicDir` | `string`   | `"../public"` | Relative path to a folder which contains static assets such as gltf files.   |

## Running the editor

To start run:

```sh
npx triplex editor
```

### Options

| Option                    | Default   | Description                                                 |
| ------------------------- | --------- | ----------------------------------------------------------- |
| `-o --open [path]`        |           | Opens your default browser with an optional scene filepath. |
| `-E --export-name <name>` | `default` | Export to use when opening a file.                          |
