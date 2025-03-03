/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type Page, type TestInfo } from "@playwright/test";
import { downloadAndUnzipVSCode } from "@vscode/test-electron/out/download";
import { join } from "upath";

export async function resolveExecPath() {
  try {
    return await downloadAndUnzipVSCode({
      version: process.env.CI ? "1.89.1" : "insiders",
    });
  } catch {
    // eslint-disable-next-line no-console
    console.log(
      "No available internet connection, using cached version of VS Code",
    );
    return join(
      process.cwd(),
      ".vscode-test/vscode-darwin-arm64-insiders/Visual Studio Code - Insiders.app/Contents/MacOS/Electron",
    );
  }
}

export async function runUseWithTrace<TPage extends { page: Page }>({
  logs,
  page,
  testInfo,
  use,
}: {
  logs: string[];
  page: TPage;
  testInfo: TestInfo;
  use: (r: TPage) => Promise<void>;
}) {
  const context = page.page.context();

  if (testInfo.retry) {
    await context.tracing.start({
      screenshots: true,
      snapshots: true,
    });
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  await use(page);

  await testInfo.attach("logs", {
    body: logs.join("\n"),
    contentType: "text/plain",
  });

  // Reset logs for the next test.
  logs.length = 0;

  if (testInfo.status !== testInfo.expectedStatus && !page.page.isClosed()) {
    const screenshot = await page.page.screenshot();
    await testInfo.attach("screenshot", {
      body: screenshot,
      contentType: "image/png",
    });
  }

  if (testInfo.retry) {
    const saveTrace =
      testInfo.status !== testInfo.expectedStatus
        ? testInfo.outputPath("trace.zip")
        : undefined;

    await context.tracing.stop({
      path: saveTrace,
    });

    if (saveTrace) {
      await testInfo.attach("trace", {
        contentType: "application/zip",
        path: saveTrace,
      });
    }
  }
}
