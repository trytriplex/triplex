require("ts-node").register({ project: __dirname + "/tsconfig.json" });

process.env.TRIPLEX_DEV = "true";

require("./src/index.ts");
