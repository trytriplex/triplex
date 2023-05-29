function stripGithubLink(message = "") {
  return message.replace(/\(#\d+\)/, "").trim();
}

function stripGithubLinksFilter(changeset) {
  const description = stripGithubLink(changeset.description);
  const subject = stripGithubLink(changeset.subject);

  return changeset.withDescription(description).withSubject(subject);
}

module.exports = {
  stripGithubLinksFilter,
};
