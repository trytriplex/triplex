import { useRouter } from "next/router";
import { ThemeConfig } from "nextra";

const config: ThemeConfig = {
  chat: {
    link: "https://discord.gg/nBzRBUEs4b",
  },
  footer: {
    text: (
      <span className="text-sm">
        © {new Date().getFullYear()}{" "}
        <a href="https://nextra.site" target="_blank">
          Michael Dougall
        </a>
      </span>
    ),
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
        titleTemplate: "%s • Triplex",
      };
    }

    return {
      titleTemplate: "%s",
    };
  },
};

export default config;
