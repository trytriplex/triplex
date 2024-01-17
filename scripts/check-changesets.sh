#!/usr/bin/env bash
DIR=./.changeset
FILES=( $(find "$DIR" -name "*.md") )

if [ ${#FILES[@]} -gt 0 ]; then # if the length of the array is more than 0
    echo "Changesets exist, aborting release..."
    exit 1
else
    echo "Changesets do not exist, releasing..."
    exit 0
fi
