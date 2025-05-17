const { stripGithubLinksFilter } = require("./filters/github");
const { getGitSource } = require("./lib/source");

module.exports = {
  customShipitFilter(changeset) {
    return stripGithubLinksFilter(changeset);
  },
  getStaticConfig() {
    return {
      repository: "git@github.com:trytriplex/ekka-game.git",
    };
  },
  getPathMappings() {
    return new Map([
      [".tsconfig", ".tsconfig"],
      ["apps/ekka-client", "apps/ekka-client"],
      ["oss-roots/ekka-game/", ""],
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
