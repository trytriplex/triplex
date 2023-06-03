import log from "electron-log";
// @ts-expect-error - We're dipping into internals to be able to get the path location
// Hopefully it will be officially exposed and we don't need to do this soon.
// See: https://github.com/megahertz/electron-log/discussions/333#discussioncomment-5835657
import variables from "electron-log/src/main/transports/file/variables";

log.initialize({ preload: true, spyRendererConsole: true });
Object.assign(console, log.functions);

const pathVariables = variables.getPathVariables(process.platform);

export const getLogPath = (): string => {
  return log.transports.file.resolvePathFn({
    ...pathVariables,
    fileName: log.transports.file.fileName,
  });
};

export function logger(scope: string) {
  return log.scope(scope);
}
