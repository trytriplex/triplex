const { stripGithubLinksFilter } = require("./filters/github");
const { getGitSource } = require("./lib/source");

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
      ["oss-roots/websocks/", ""],
      ["packages/websocks-client", "packages/websocks-client"],
      ["packages/websocks-server", "packages/websocks-server"],
      ["scripts", "scripts"],
    ]);
  },
  getStrippedFiles() {
    return new Set([]);
  },
  getBranchConfig() {
    return {
      source: getGitSource(),
      destination: "main",
    };
  },
};
