/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
