When opening a pull request if you're changing anything across the stack, such as server and editor packages, make sure to run playwright tests by adding this to the pull request description:

```markdown
/playwright # Runs all tests

/playwright-vsce # Runs only Triplex for VS Code tests

/playwright-election # Runs only Triplex Standalone tests
```
