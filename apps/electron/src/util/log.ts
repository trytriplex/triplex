import log from "electron-log";

log.initialize({ preload: true, spyRendererConsole: true });
Object.assign(console, log.functions);

export const getLogPath = (): string => {
  return log.transports.file.getFile().path;
};

export function logger(scope: string) {
  return log.scope(scope);
}
