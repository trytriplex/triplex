import log from "electron-log";

log.initialize({ preload: true, spyRendererConsole: true });
Object.assign(console, log.functions);
log.errorHandler.startCatching();

export function logger(scope: string) {
  return log.scope(scope);
}
