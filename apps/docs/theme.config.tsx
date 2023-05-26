import { useRouter } from "next/router";
import { ThemeConfig } from "nextra";
import { Footer } from "./components/footer";

const config: ThemeConfig = {
  darkMode: false,
  nextThemes: {
    forcedTheme: "dark",
  },
  primaryHue: 200,
  chat: {
    link: "https://discord.gg/nBzRBUEs4b",
  },
  footer: {
    component: <Footer />,
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
  },
  docsRepositoryBase:
    "https://github.com/try-triplex/triplex/tree/main/apps/docs",
  logo: <h1 className="text-2xl font-medium">Triplex</h1>,
  project: {
    link: "https://github.com/try-triplex/triplex",
  },
  head: <></>,
  useNextSeoProps() {
    const { asPath } = useRouter();
    if (asPath !== "/") {
      return {
        titleTemplate: "%s — Triplex",
      };
    }

    return {
      titleTemplate: "%s",
    };
  },
};

export default config;
