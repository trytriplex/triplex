# @docs/triplex

This package contains the code for https://triplex.dev. It's a Next.js / Nextra
app that is heavily customized to get the branding we want.

To run locally:

```bash
# Run from root
pnpm dev:docs
```

- Want to update the root theme? See
  [nextra-triplex](../nextra-triplex/index.tsx)
- Want to add a blog? See [blog](./blog/)
- Want to add docs? See [docs](./docs/)

## Q & A

- Q: How do I update the sidenav text? A: Update the sibling `meta.json` file,
  where the key is the file name and the value is the name you want.
- Q: How do I update the page title? A: Add `title` frontmatter to the MDX file.
