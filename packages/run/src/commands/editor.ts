import { createServer as createBackendServer } from "@triplex/server";
import { createServer as createFrontendServer } from "@triplex/client";
import express from "express";
import openBrowser from "open";

export async function editor({
  open,
  files,
  publicDir,
  exportName,
  components,
}: {
  components: string[];
  open?: boolean | string;
  publicDir?: string;
  files: string[];
  exportName?: string;
}) {
  const { default: ora } = await import("ora");
  const spinner = ora("Starting...\n").start();

  const frontendServer = await createFrontendServer({
    target: "web",
    components,
    open,
    publicDir,
    exportName,
    files,
  });
  const backendServer = await createBackendServer({ files, components });
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
