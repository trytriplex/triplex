import { appendFile } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";

export function logger(group: string) {
  return (...message: string[]) => {
    if (
      process.env.TRIPLEX_ENV === "development" ||
      process.env.DEBUG?.includes("triplex")
    ) {
      console.log(`[triplex:${group}]`, ...message);
    }
  };
}

export function attachFSLogger(dir: string) {
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;
  const filePath = join(dir, "triplex.log");

  console.error = (...messages) => {
    originalError.apply(console, messages);
    appendFile(filePath, "[ERRR] " + messages.join("\n") + "\n");
  };

  console.log = (...messages) => {
    originalLog.apply(console, messages);
    appendFile(filePath, "[LOGG] " + messages.join("\n") + "\n");
  };

  console.warn = (...messages) => {
    originalWarn.apply(console, messages);
    appendFile(filePath, "[WARN] " + messages.join("\n") + "\n");
  };

  process.on("uncaughtException", (err, origin) => {
    appendFile(filePath, "[ERRR] " + `@_${origin}_@` + err);
  });

  return () => {
    console.error = originalError;
    console.log = originalLog;
    console.warn = originalError;
  };
}
