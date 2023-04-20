import nextra from "nextra";

const withNextra = nextra({
  staticImage: true,
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
});

export default withNextra();
