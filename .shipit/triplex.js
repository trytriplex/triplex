module.exports = {
  getStaticConfig() {
    return {
      repository: "git@github.com:try-triplex/triplex.git",
    };
  },
  getPathMappings() {
    return new Map([
      ["apps", "apps"],
      ["examples", "examples"],
      ["packages", "packages"],
    ]);
  },
  getStrippedFiles() {
    return new Set([
      /^\.github\/workflows\/release-electron\.yml/,
      /^.shipit/,
      /^apps\/electron/,
      /^packages\/bridge/,
      /^packages\/client/,
      /^packages\/server/,
      /^packages\/ws-client/,
      /^scripts/,
    ]);
  },
  getBranchConfig() {
    return {
      source: "origin/main",
      destination: "test",
    };
  },
};
