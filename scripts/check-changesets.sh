if [ -f ./.changeset/*.md ]; then 
    echo "Changesets exist, aborting release..."
    exit 1
else 
    echo "Changesets do not exist, releasing..."
    exit 0
fi
