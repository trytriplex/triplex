<p align="center">
  <a href="#">
    <picture>
      <image width="128" height="128" src="https://user-images.githubusercontent.com/6801309/220534156-eb195365-a438-4233-b83c-a5463c57b1e9.png" />
    </picture>
  </a>
  <h1 align="center"><strong>TRIPLEX</strong></h1>
</p>

<p align="center">
  The React Three Fiber framework and editor that saves your changes back to source.
</p>

<p align="center">
  <img src="https://user-images.githubusercontent.com/6801309/220804091-727e8d3c-d726-4244-8bd0-e30b97a2be06.png" />
</p>

## Getting started

TRIPLEX is made to work standalone and with other frameworks like Next.js or Remix.
To start run this command in a folder you want to initialize:

> **Note** - Starting fresh? Create a folder first.
>
> ```
> mkdir my-triplex-app
> cd my-triplex-app
> ```

```sh
npx @triplex/run@latest init
```

And follow the prompts.

### Config

After initializing you can configure TRIPLEX using the `config.json` file,
find it in the `.triplex` folder.

| Option      | Type       | Description                                                                                           |
| ----------- | ---------- | ----------------------------------------------------------------------------------------------------- |
| `files`     | `string[]` | Relative file path globs TRIPLEX uses to find scene files.                                            |
| `publicDir` | `string`   | Relative path to a folder which contains static assets such as gltf files. Defaults to `"../public"`. |

## Running the editor

TRIPLEX has an embedded editor that syncs changes back and fourth from scene to source.
To start run:

```sh
npx triplex editor
```

### Options

| Option                    | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| `-o --open [path]`        | Open your default browser with an optional filepath.   |
| `-E --export-name <name>` | Specify the export name when opening a file [default]. |
