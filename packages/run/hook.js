require("ts-node").register();

process.env.TRIPLEX_DEV = "true";

require("./src/index.ts");
