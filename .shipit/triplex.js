const { stripGithubLinksFilter } = require("./filters/github");
const { getGitSource } = require("./lib/source");

module.exports = {
  customShipitFilter(changeset) {
    return stripGithubLinksFilter(changeset);
  },
  getStaticConfig() {
    return {
      repository: "git@github.com:trytriplex/triplex.git",
    };
  },
  getPathMappings() {
    return new Map([
      [".changeset", ".changeset"],
      [".tsconfig", ".tsconfig"],
      ["apps/docs", "apps/docs"],
      ["examples", "examples"],
      ["oss-roots/triplex/", ""],
      ["packages/bridge", "packages/bridge"],
      ["packages/create-triplex-project", "packages/create-triplex-project"],
      ["packages/lib", "packages/lib"],
      ["packages/react-three-test", "packages/react-three-test"],
      ["packages/renderer", "packages/renderer"],
      ["scripts", "scripts"],
    ]);
  },
  getStrippedFiles() {
    return new Set([
      /scripts\/apply-publish-config.js/,
      /scripts\/check-changesets.sh/,
    ]);
  },
  getBranchConfig() {
    return {
      source: getGitSource(),
      destination: "main",
    };
  },
};
