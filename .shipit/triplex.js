const { stripGithubLinksFilter } = require("./filters/github");

module.exports = {
  customShipitFilter(changeset) {
    return stripGithubLinksFilter(changeset);
  },
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
      ["packages/create-triplex-project", "packages/create-triplex-project"],
      ["packages/react-three-test", "packages/react-three-test"],
      ["oss-roots/triplex/", ""],
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
      source: "origin/main",
      destination: "main",
    };
  },
};
