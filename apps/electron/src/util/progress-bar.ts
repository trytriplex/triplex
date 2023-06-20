import type { BrowserWindow } from "electron";

export function indeterminate(window: BrowserWindow, signal?: AbortSignal) {
  let timeoutId: NodeJS.Timeout | undefined = undefined;

  function increment(progress: number) {
    if (window.isDestroyed()) {
      return;
    }

    timeoutId = setTimeout(() => {
      let nextProgress = progress + Math.random() * 0.01;
      if (nextProgress > 1.01) {
        // We are now indeterminate so don't need to increment anymore.
        return;
      } else if (nextProgress > 0.8) {
        nextProgress = progress + Math.random() * 0.005;
      }

      window.setProgressBar(nextProgress);
      window.webContents.send("progress-bar-change", nextProgress);
      increment(nextProgress);
    }, 100);
  }

  signal?.addEventListener("abort", () => {
    clearTimeout(timeoutId);
    window.setProgressBar(-1);
    window.webContents.send("progress-bar-change", -1);
  });

  window.setProgressBar(0);
  increment(0);

  return () => {
    return new Promise<void>((resolve) => {
      clearTimeout(timeoutId);
      window.setProgressBar(1);
      window.webContents.send("progress-bar-change", 1);

      setTimeout(() => {
        if (window.isDestroyed()) {
          return;
        }

        window.setProgressBar(-1);
        window.webContents.send("progress-bar-change", -1);
        resolve();
      }, 200);
    });
  };
}
