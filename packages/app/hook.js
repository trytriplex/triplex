// eslint-disable-next-line @typescript-eslint/no-var-requires
require("ts-node").register({ project: __dirname + "/tsconfig.json" });

process.env.TRIPLEX_DEV = "true";

require("./src/entrypoints/main.ts");
