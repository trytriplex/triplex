/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
const { join } = require("node:path");
const { readFileSync, writeFileSync } = require("node:fs");

const pkgJSON = JSON.parse(readFileSync(join(process.cwd(), "package.json")));

pkgJSON.pnpm.overrides = {
  ...pkgJSON.pnpm.overrides,
  "@react-three/drei": "9.121.4",
  "@react-three/fiber": "8.17.14",
  "@types/react": "18.3.12",
  "@types/react-dom": "18.3.1",
  react: "18.3.1",
  "react-dom": "18.3.1",
};

writeFileSync(
  join(process.cwd(), "package.json"),
  JSON.stringify(pkgJSON, null, 2),
);
