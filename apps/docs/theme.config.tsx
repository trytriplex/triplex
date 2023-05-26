import { useRouter } from "next/router";
import Link from "next/link";
import { ThemeConfig } from "nextra";

const config: ThemeConfig = {
  darkMode: false,
  primaryHue: 200,
  chat: {
    link: "https://discord.gg/nBzRBUEs4b",
  },
  footer: {
    component: (
      <div className="mx-auto flex justify-center gap-14 border-t border-neutral-800 px-6 py-10 lg:gap-32">
        <div className="">
          <span className="text-sm font-medium text-neutral-400">Triplex</span>{" "}
          <span className="text-sm text-neutral-400">
            — Built in Sydney, Australia
          </span>
        </div>

        <div className="flex flex-wrap gap-14 lg:gap-32">
          <ul className="flex flex-col gap-4">
            <span className="text-sm font-medium text-neutral-200">
              Product
            </span>
            <li>
              <Link
                href="/docs/setup/overview"
                className="text-sm text-neutral-400 hover:text-neutral-200"
              >
                Setup
              </Link>
            </li>
            <li>
              <Link
                href="/docs/get-started/user-interface"
                className="text-sm text-neutral-400 hover:text-neutral-200"
              >
                User Interface
              </Link>
            </li>
            <li>
              <Link
                href="/docs/get-started/settings"
                className="text-sm text-neutral-400 hover:text-neutral-200"
              >
                Settings
              </Link>
            </li>
            <li>
              <Link
                href="https://github.com/try-triplex/triplex/releases"
                className="text-sm text-neutral-400 hover:text-neutral-200"
              >
                Changelog
              </Link>
            </li>
          </ul>

          <ul className="flex flex-col gap-4">
            <span className="text-sm font-medium text-neutral-200">
              Resources
            </span>
            <li>
              <Link
                href="https://discord.gg/nBzRBUEs4b"
                className="text-sm text-neutral-400 hover:text-neutral-200"
              >
                Community
              </Link>
            </li>
            <li>
              <Link
                href="https://github.com/try-triplex/triplex/issues/new"
                className="text-sm text-neutral-400 hover:text-neutral-200"
              >
                Raise an Issue
              </Link>
            </li>
            <li>
              <Link
                href="/docs/faq"
                className="text-sm text-neutral-400 hover:text-neutral-200"
              >
                FAQ
              </Link>
            </li>
          </ul>

          <ul className="flex flex-col gap-4">
            <span className="text-sm font-medium text-neutral-200">
              Developers
            </span>
            <li>
              <Link
                href="/docs/api-reference/cli"
                className="text-sm text-neutral-400 hover:text-neutral-200"
              >
                API
              </Link>
            </li>
            <li>
              <Link
                href="https://github.com/try-triplex/triplex"
                className="text-sm text-neutral-400 hover:text-neutral-200"
              >
                Github
              </Link>
            </li>
            <li>
              <Link
                href="/license"
                className="text-sm text-neutral-400 hover:text-neutral-200"
              >
                License
              </Link>
            </li>
          </ul>
        </div>
      </div>
    ),
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
