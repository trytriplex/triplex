const { stripGithubLinksFilter } = require("./filters/github");

module.exports = {
  customShipitFilter(changeset) {
    return stripGithubLinksFilter(changeset);
  },
  getStaticConfig() {
    return {
      repository: "git@github.com:trytriplex/websocks.git",
    };
  },
  getPathMappings() {
    return new Map([
      [".tsconfig", ".tsconfig"],
      ["packages/websocks-client", "packages/websocks-client"],
      ["packages/websocks-server", "packages/websocks-server"],
      ["scripts", "scripts"],
      ["oss-roots/websocks/", ""],
    ]);
  },
  getStrippedFiles() {
    return new Set([]);
  },
  getBranchConfig() {
    return {
      source: "origin/main",
      destination: "main",
    };
  },
};
