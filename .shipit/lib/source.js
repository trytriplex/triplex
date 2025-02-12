module.exports = {
  getGitSource() {
    if (process.env.GITHUB_HEAD_REF) {
      // We're running in a pull request so we're performing a dry run.
      return `origin/${process.env.GITHUB_HEAD_REF}`;
    }

    return "origin/main";
  },
};
