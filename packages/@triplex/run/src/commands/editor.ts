/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { createServer as createFrontendServer } from "@triplex/client";
import { createServer as createBackendServer } from "@triplex/server";
import express from "express";
import openBrowser from "open";

export async function editor({
  assetsDir,
  components,
  exportName,
  files,
  open,
  publicDir,
}: {
  assetsDir: string;
  components: string[];
  exportName?: string;
  files: string[];
  open?: boolean | string;
  publicDir: string;
}) {
  const { default: ora } = await import("ora");
  const spinner = ora("Starting...\n").start();

  const frontendServer = await createFrontendServer({
    files,
    publicDir,
    target: "web",
  });
  const backendServer = await createBackendServer({
    assetsDir,
    components,
    files,
    publicDir,
  });
  const editorPort = 5754;

  await frontendServer.listen(3333);
  await backendServer.listen(8000);

  if (process.env.TRIPLEX_ENV === "development") {
    const { createDevServer } = require("@triplex/editor");
    const devServer = await createDevServer();
    await devServer.listen(editorPort);
  } else {
    const app = express();
    const path = require
      .resolve("@triplex/editor/dist/index.html")
      .replace("index.html", "");

    app.use(express.static(path));

    await app.listen(editorPort);
  }

  if (open) {
    const searchParam = typeof open === "string" ? `?path=${open}` : "";

    await openBrowser(
      `http://localhost:${editorPort}/${searchParam}&exportName=${exportName}`
    );
  }

  spinner.succeed(
    open
      ? `Now open at http://localhost:${editorPort}`
      : `Now available at http://localhost:${editorPort}`
  );
}
