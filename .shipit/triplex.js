module.exports = {
  getStaticConfig() {
    return {
      repository: "git@github.com:try-triplex/triplex.git",
    };
  },
  transformCommitMessage: (message) => {
    return message.replace(/\(#\d+\)/, "").trim();
  },
  getPathMappings() {
    return new Map([
      [".changeset", ".changeset"],
      [".tsconfig", ".tsconfig"],
      [".vscode", ".vscode"],
      ["apps/docs", "apps/docs"],
      ["examples", "examples"],
      ["packages/bridge", "packages/bridge"],
      ["packages/create-triplex-project", "packages/create-triplex-project"],
      ["packages/editor", "packages/editor"],
      ["packages/react-three-test", "packages/react-three-test"],
      ["packages/run", "packages/run"],
      ["packages/scene", "packages/scene"],
      ["oss-roots/triplex/", ""],
    ]);
  },
  getStrippedFiles() {
    return new Set([/^.github\/workflows\/(electron|shipit|release)/]);
  },
  getBranchConfig() {
    return {
      source: "origin/main",
      destination: "main",
    };
  },
};
