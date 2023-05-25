module.exports = {
  getStaticConfig() {
    return {
      repository: "git@github.com:try-triplex/triplex.git",
    };
  },
  getPathMappings() {
    return new Map([
      [".changeset", ".changeset"],
      [".tsconfig", ".tsconfig"],
      [".vscode", ".vscode"],
      ["apps/docs", "apps/docs"],
      ["examples", "examples"],
      ["packages", "packages"],
      ["oss-roots/triplex/", ""],
    ]);
  },
  getStrippedFiles() {
    return new Set([
      /^.github\/workflows\/(electron|shipit|release)/,
      /^packages\/(client|server|ws-client)/,
    ]);
  },
  getBranchConfig() {
    return {
      source: "origin/main",
      destination: "main",
    };
  },
};
