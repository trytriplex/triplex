/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { NextraThemeLayoutProps } from "nextra";
import { MDXProvider, useMDXComponents, type Components } from "nextra/mdx";
import { normalizePages } from "nextra/normalize-pages";
import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEventHandler,
} from "react";
import { SendFeedback } from "../components/feedback";
import { Footer } from "../components/footer";
import { Header, HeaderItem } from "../components/header";
import { useSearchStore } from "../stores/search";
import { cn } from "../util/cn";
import { friendlyDate } from "../util/date";
import socials from "../util/socials.json";
import { BASE_URL } from "../util/url";
import { SideNavItem } from "./side-nav-item";

const components: Components = {
  MetaDiff: ({
    action,
    source,
    target,
    transform = "none",
  }: {
    action: "add" | "remove";
    source: string;
    target: string;
    transform?: "glob" | "none";
  }) => {
    const transforms = {
      glob: (value: string) => value?.replace(/\/\w+\.([jt]sx)$/, "/*.$1"),
      none: (value: string) => value,
    };
    const applyAction = (value: string, targetValue: string) => {
      let startIndex = value.indexOf(targetValue);

      while (value[startIndex] !== "\n" && startIndex > 0) {
        startIndex -= 1;
      }

      if (startIndex === -1) {
        return value;
      }

      startIndex += 1;

      return (
        value.slice(0, startIndex) +
        (action === "add" ? "+" : "-") +
        value.slice(startIndex + 1)
      );
    };
    const search = useSearchParams();
    const meta = JSON.parse(search.get("meta") || `{}`);
    const transformer = transforms[transform];
    const targetValue = transformer(meta[target]);

    delete meta[target];

    if (Array.isArray(meta[source])) {
      meta[source].push(targetValue);
    }

    const code = applyAction(JSON.stringify(meta, null, 2), targetValue);

    return (
      <pre className="mt-5 whitespace-break-spaces rounded-xl bg-white/5 p-3 text-lg text-neutral-300 md:text-base">
        <code>{code}</code>
      </pre>
    );
  },
  PickMeta: ({ pick }: { pick: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { li: ListItem, ul: List } = useMDXComponents() as any;
    const search = useSearchParams();
    const meta = JSON.parse(search.get("meta") || `{}`);
    const picked = Array.isArray(meta[pick]) ? meta[pick] : [meta[pick]];

    return (
      <List>
        {picked.map((item: string, index: number) => (
          <ListItem key={item + index}>{item || "..."}</ListItem>
        ))}
      </List>
    );
  },
  Video: ({ src }) => (
    <video className="mt-5 w-full rounded-xl" controls src={src} />
  ),
  a: ({ children, href }) => (
    <Link className="text-blue-400 underline" href={href || ""}>
      {children}
    </Link>
  ),
  code: ({ children }) => {
    return typeof children === "string" ? (
      // Inline code
      <code className="border border-neutral-700 px-1.5 py-0.5 font-mono text-lg text-neutral-300 md:text-base">
        {children}
      </code>
    ) : (
      // Code block powered by shiki
      // See: https://shiki.matsu.io/guide/theme-colors#css-variables-theme
      <code className="[--shiki-color-text:#ccfbf1] [--shiki-token-comment:#16a34a] [--shiki-token-constant:#5eead4] [--shiki-token-function:#5eead4] [--shiki-token-keyword:#60a5fa] [--shiki-token-link:#facc15] [--shiki-token-parameter:#9ca3af] [--shiki-token-punctuation:#2dd4bf] [--shiki-token-string-expression:#fda4af] [&_.highlighted]:border [&_.highlighted]:border-yellow-500 [&_.highlighted]:bg-slate-800 [&_.line.highlighted]:float-left [&_.line.highlighted]:w-full">
        {children}
      </code>
    );
  },
  h1: () => (
    <i className="text-red-400">Define title frontmatter instead of heading</i>
  ),
  h2: ({ children, id }) => (
    <div className="mt-14">
      <h2
        className="inline scroll-m-20 text-3xl font-medium text-neutral-200 target:bg-blue-400 target:text-neutral-900"
        id={id}
      >
        {children}
      </h2>
    </div>
  ),
  h3: ({ children, id }) => (
    <div className="mt-10">
      <h3
        className="inline scroll-m-20 text-2xl font-medium text-neutral-200 target:bg-blue-400 target:text-neutral-900"
        id={id}
      >
        {children}
      </h3>
    </div>
  ),
  h4: ({ children, id }) => (
    <div className="mt-6">
      <h4
        className="inline scroll-m-20 text-xl font-medium text-neutral-200 target:bg-blue-400 target:text-neutral-900"
        id={id}
      >
        {children}
      </h4>
    </div>
  ),
  li: ({ children }) => (
    <li className="ml-4 text-xl text-neutral-300 md:text-lg">{children}</li>
  ),
  ol: ({ children }) => <ol className="mt-5 list-decimal">{children}</ol>,
  p: ({ children }) => (
    <p className="mt-5 text-xl text-neutral-300 md:text-lg">{children}</p>
  ),
  pre: ({ children, ...props }) => {
    return (
      <div className="mt-5">
        {"filename" in props && typeof props.filename === "string" && (
          <div className="border border-b-0 border-neutral-700 bg-neutral-900 py-0.5 pl-3">
            <span className="text-sm text-neutral-300">{props.filename}</span>
          </div>
        )}
        <pre className="whitespace-break-spaces border border-neutral-700 p-3 text-lg text-neutral-300 md:text-base">
          {children}
        </pre>
      </div>
    );
  },
  table: ({ children }) => <table className="mt-5">{children}</table>,
  td: ({ children }) => <td className="text-neutral-300">{children}</td>,
  th: ({ children }) => (
    <th className="text-left text-neutral-400">{children}</th>
  ),
  ul: ({ children }) => <ul className="mt-5 list-disc">{children}</ul>,
};

function renderDocsItem(
  link: ReturnType<typeof normalizePages>["docsDirectories"][0],
  route: string,
  level = 0,
): JSX.Element | null {
  if (!link.isUnderCurrentDocsTree || link.type === "separator") {
    return null;
  }

  const url =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    link.firstChildRoute || (link as any).href || link.route;

  if (link.kind === "Folder") {
    return (
      <Fragment key={url}>
        <div className="mt-6 py-1.5 text-base font-medium text-neutral-100">
          {link.title}
        </div>
        {link.children &&
          link.children.map((item) => renderDocsItem(item, route, level + 1))}
      </Fragment>
    );
  }

  return (
    <SideNavItem
      href={url}
      isChildSelected={link.children?.some((child) => child.route === route)}
      isSelected={route === url}
      key={url}
      level={level}
      title={link.title}
    >
      {link.children &&
        link.children.map((item) => renderDocsItem(item, route, level + 1))}
    </SideNavItem>
  );
}

interface SearchResult {
  id: string;
  route: string;
  title: string;
}

type SearchResultKeys = (keyof SearchResult)[];

function SearchModal({
  onClose,
  pages,
}: {
  onClose: () => void;
  pages: ReturnType<typeof normalizePages>["docsDirectories"][0][];
}) {
  type FlexSearchType = import("flexsearch").Document<
    SearchResult,
    SearchResultKeys
  >;

  const ref = useRef<HTMLDialogElement>(null!);
  const [filter, setFilter] = useState("");
  const [index, setIndex] = useState<FlexSearchType>();
  const searchResults: SearchResult[] = useMemo(() => {
    if (!index) {
      return [];
    }

    const foundFields = index.search<true>(filter, 5, {
      enrich: true,
      suggest: true,
    });

    if (foundFields.length === 0) {
      return [];
    }

    const foundResults: SearchResult[] = [];

    foundFields.forEach((field) => {
      field.result.forEach((res) => {
        foundResults.push({
          id: res.doc.id,
          route: res.doc.route,
          title: res.doc.title,
        });
      });
    });

    return foundResults.slice(0, 5);
  }, [filter, index]);

  useEffect(() => {
    async function prepIndex() {
      const { default: FlexSearch } = await import("flexsearch");

      if (index) {
        return;
      }

      const newIndex = new FlexSearch.Document<SearchResult, SearchResultKeys>({
        cache: 100,
        context: {
          bidirectional: true,
          depth: 2,
          resolution: 9,
        },
        document: {
          id: "id",
          index: ["title", "content"],
          store: ["title", "route", "id"],
        },
        tokenize: "full",
      });

      pages.forEach((page) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const route = (page as any).href || page.route;

        const document = {
          content: "",
          id: route + page.title,
          route,
          title: page.title,
        };

        newIndex.add(document);
      });

      setIndex(newIndex);
    }

    prepIndex();
  }, [index, pages]);

  useEffect(() => {
    const element = ref.current;

    if (!element.open) {
      element.showModal();
    }

    function onEscapePressHandler(e: Event) {
      e.preventDefault();
      onClose();
    }

    function onClickBlanketHandler(e: MouseEvent) {
      if (e.target === ref.current) {
        ref.current.close();
        onClose();
      }
    }

    element.addEventListener("cancel", onEscapePressHandler);
    element.addEventListener("click", onClickBlanketHandler);

    return () => {
      element.removeEventListener("cancel", onEscapePressHandler);
      element.removeEventListener("click", onClickBlanketHandler);
    };
  }, [onClose]);

  const onSearchResultClickHandler: MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target instanceof HTMLElement && e.target.tagName === "A") {
      onClose();
    }
  };

  return (
    <dialog
      className="m-auto mt-10 w-full rounded-lg border border-neutral-700 bg-neutral-950 p-0 backdrop:bg-black/70 md:mt-32 md:max-w-2xl"
      ref={ref}
    >
      <form method="dialog">
        <div className="flex items-center">
          <input
            className="w-full rounded bg-transparent px-4 py-4 text-lg text-neutral-200 placeholder:text-neutral-400 focus:outline-none md:text-lg"
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search documentation..."
            type="text"
          />

          <div className="mr-4 rounded border border-neutral-600 bg-white/5 px-1.5 py-0.5 text-xs text-neutral-400 md:block">
            ESC
          </div>
        </div>
      </form>

      {searchResults.length > 0 && (
        <div
          className="flex flex-col border-t border-neutral-800 py-1.5"
          onClick={onSearchResultClickHandler}
        >
          {searchResults.map((res) => (
            <Link
              className="px-4 py-1 text-lg text-neutral-300 hover:bg-white/5 md:text-base"
              href={res.route}
              key={res.id}
              target={res.route.startsWith("http") ? "_blank" : undefined}
            >
              {res.title}
            </Link>
          ))}
        </div>
      )}
    </dialog>
  );
}

function Layout({ children, pageOpts }: NextraThemeLayoutProps) {
  const { frontMatter, headings, pageMap, route, title } = pageOpts;

  const [isNavMenuOpen, setNavOpen] = useState(false);
  const searchOpen = useSearchStore((store) => store.isOpen);
  const closeSearch = useSearchStore((store) => () => store.setIsOpen(false));

  const result = useMemo(
    () =>
      normalizePages({
        list: pageMap,
        locale: "en_US",
        route,
      }),
    [pageMap, route],
  );

  const previousPage = result.flatDocsDirectories[result.activeIndex - 1];
  const nextPage = result.flatDocsDirectories[result.activeIndex + 1];
  const pageItems = result.flatDocsDirectories.filter(
    (item) => item.isUnderCurrentDocsTree,
  );
  const selectedHeaderItem = result.topLevelNavbarItems.findLast((item) => {
    const toFind = item.route || item.href;
    if (toFind) {
      return route.startsWith(toFind);
    }

    return false;
  });
  const hasPageAuthorOrDate = frontMatter.date || frontMatter.author;

  useEffect(() => {
    setNavOpen(false);
  }, [route]);

  return (
    <>
      <Header onShowNav={() => setNavOpen((prev) => !prev)}>
        {result.topLevelNavbarItems.map((item) => (
          <HeaderItem
            href={item.href || item.children?.[0].route || item.route}
            isSelected={selectedHeaderItem === item}
            key={item.title}
          >
            {item.title}
          </HeaderItem>
        ))}
      </Header>

      {isNavMenuOpen && (
        <div className="fixed left-0 right-0 top-14 z-40 max-h-[calc(100vh-3.5rem)] overflow-auto border-b border-neutral-900 bg-neutral-950 px-6 py-6 text-white md:hidden">
          {result.topLevelNavbarItems.map((item) => (
            <div className="mb-2" key={item.title}>
              <Link
                className="text-xl text-neutral-300 hover:text-neutral-100"
                href={item.href || item.firstChildRoute || item.route}
              >
                {item.title}
              </Link>
            </div>
          ))}

          {pageItems.length > 0 ? (
            <hr className="-mx-2 my-6 border-neutral-900" />
          ) : null}

          {pageItems.map((item) => (
            <div className="mb-2" key={item.title}>
              <Link
                className="text-xl text-neutral-300 hover:text-neutral-100"
                href={item.firstChildRoute || item.route}
              >
                {item.title}
              </Link>
            </div>
          ))}
        </div>
      )}

      {result.activeThemeContext.layout === "default" && (
        <nav
          aria-label="page tree"
          className="col-span-3 hidden w-full pr-10 pt-12 md:block md:pb-10 lg:pb-14"
        >
          <div className="sticky top-20 flex flex-col items-start pl-6 md:pl-8 lg:pl-20">
            {result.docsDirectories.map((item) => renderDocsItem(item, route))}
          </div>
        </nav>
      )}

      <main
        className={cn([
          "relative",
          result.activeThemeContext.layout === "raw" && "col-span-full",
          result.activeThemeContext.layout === "default" &&
            "col-span-full px-6 md:col-span-9 md:pl-0 md:pr-8 lg:pr-20",
          result.activeThemeContext.layout === "full" &&
            "col-span-full mx-auto w-full max-w-7xl px-6",
        ])}
      >
        {result.activeThemeContext.layout !== "raw" && (
          <div
            className="relative -mx-6 flex border-b border-t border-neutral-700 md:mx-0 md:mt-8 md:border"
            style={{ "--grid": "100px" }}
          >
            <div className="relative flex basis-2/3 flex-col justify-center gap-2 px-6 py-8 [background:repeating-linear-gradient(transparent,transparent_var(--grid),#292929_var(--grid),#292929_calc(var(--grid)+1px)),repeating-linear-gradient(to_right,transparent,transparent_var(--grid),#292929_var(--grid),#292929_calc(var(--grid)+1px))] md:min-h-[16rem] md:px-14 md:py-14 lg:min-h-[20rem] lg:basis-3/5">
              {hasPageAuthorOrDate && (
                <div className="space-x-1">
                  {frontMatter.date && (
                    <time
                      className="text-neutral-400"
                      dateTime={frontMatter.date}
                    >
                      {friendlyDate(frontMatter.date)}
                    </time>
                  )}
                  {frontMatter.author && frontMatter.date && (
                    <span className="text-neutral-400"> · </span>
                  )}
                  {frontMatter.author && (
                    <a
                      className="text-neutral-400 underline hover:text-neutral-100"
                      href={
                        frontMatter.author in socials
                          ? socials[frontMatter.author as keyof typeof socials]
                              .url
                          : "#"
                      }
                      rel="noreferrer"
                      target="_blank"
                    >
                      {frontMatter.author}
                    </a>
                  )}
                </div>
              )}
              {!hasPageAuthorOrDate && result.activeThemeContext.breadcrumb && (
                <div className="flex flex-wrap items-center gap-x-0.5">
                  {result.activePath.map((path, index) =>
                    index === 0 ? null : (
                      <Fragment key={path.route}>
                        <Link
                          className="text-base text-neutral-400 hover:text-neutral-300"
                          href={path.kind === "MdxPage" ? path.route : ""}
                        >
                          {path.title}
                        </Link>
                        {index !== result.activePath.length - 1 && (
                          <ChevronRightIcon className="text-neutral-400" />
                        )}
                      </Fragment>
                    ),
                  )}
                </div>
              )}
              <h1 className="text-3xl font-bold text-neutral-200 lg:text-4xl">
                {title}
              </h1>
              {frontMatter.description && (
                <div className="text-lg text-neutral-400">
                  {frontMatter.description}
                </div>
              )}
            </div>
            <div className="relative basis-1/2 overflow-hidden">
              <div className="absolute -left-full bottom-0 right-0 top-0 [background:repeating-conic-gradient(#141414_0%_25%,#212121_0%_50%)_left_top/calc(var(--grid)*2+2px)_calc(var(--grid)*2+2px)]" />
              {frontMatter.image && (
                <Image
                  alt=""
                  className="rounded-none object-cover py-1 pr-1"
                  fill
                  src={frontMatter.image}
                />
              )}
            </div>
            <div className="pointer-events-none absolute inset-0 border-4 border-neutral-950" />
          </div>
        )}

        <div
          className={cn([
            result.activeThemeContext.layout === "raw" && "contents",
            result.activeThemeContext.layout !== "raw" &&
              "grid grid-cols-12 py-10 md:px-14 lg:py-14",
          ])}
        >
          <div
            className={cn([
              result.activeThemeContext.layout === "raw" && "contents",
              result.activeThemeContext.layout !== "raw" &&
                "col-span-full xl:col-span-9 [&>*:first-child]:m-0",
            ])}
          >
            {children}

            {(result.activeThemeContext.pagination ||
              ("feedback" in result.activeThemeContext &&
                typeof result.activeThemeContext.feedback === "boolean" &&
                result.activeThemeContext.feedback)) && (
              <div className="mt-10 flex flex-col gap-10 border-t border-neutral-800 pt-8 lg:mt-20 lg:pt-12">
                {result.activeThemeContext.pagination && (
                  <nav aria-label="pages navigation" className="flex">
                    {previousPage && (
                      <div className="flex flex-col">
                        <span className="-mb-0.5 ml-[15px] pl-2 text-sm text-neutral-400">
                          Previous
                        </span>
                        <Link
                          className="flex items-center gap-2 text-xl text-neutral-300 hover:text-neutral-100 md:text-lg"
                          href={previousPage.route}
                        >
                          <ArrowLeftIcon className="text-neutral-400" />
                          {previousPage.title}
                        </Link>
                      </div>
                    )}
                    {nextPage && nextPage.route !== "#" && (
                      <div className="ml-auto flex flex-col">
                        <span className="-mb-0.5 text-sm text-neutral-400">
                          Next
                        </span>
                        <Link
                          className="flex items-center gap-2 text-xl text-neutral-300 hover:text-neutral-100 md:text-lg"
                          href={nextPage.route}
                        >
                          {nextPage.title}
                          <ArrowRightIcon className="text-neutral-400" />
                        </Link>
                      </div>
                    )}
                  </nav>
                )}
                {"feedback" in result.activeThemeContext &&
                  typeof result.activeThemeContext.feedback === "boolean" &&
                  result.activeThemeContext.feedback && <SendFeedback />}
              </div>
            )}
          </div>
          {result.activeThemeContext.layout !== "raw" && !!headings.length && (
            <nav
              aria-label="on this page"
              className="col-span-3 hidden justify-self-start pl-10 xl:block"
            >
              <div className="sticky top-20 flex flex-col gap-2">
                <span className="text-sm font-medium text-neutral-200">
                  On this page
                </span>
                {headings.map((h) => (
                  <div key={h.id} style={{ paddingLeft: (h.depth - 2) * 8 }}>
                    <Link
                      className="text-sm text-neutral-400 hover:text-neutral-200"
                      href={`#${h.id}`}
                    >
                      {h.value}
                    </Link>
                  </div>
                ))}
                <div className="mt-2 border-t border-neutral-800 pt-3">
                  <a
                    className="text-sm text-neutral-400 hover:text-neutral-200"
                    href={`https://github.com/try-triplex/triplex/tree/main/apps/docs/${pageOpts.filePath}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Suggest an edit to this page
                  </a>
                </div>
              </div>
            </nav>
          )}
        </div>
      </main>

      <Footer />

      {searchOpen && (
        <SearchModal onClose={closeSearch} pages={result.flatDirectories} />
      )}
    </>
  );
}

export default function TriplexTheme({
  children,
  pageOpts,
  pageProps,
  themeConfig,
}: NextraThemeLayoutProps) {
  const { frontMatter, title } = pageOpts;
  const imgTitle = encodeURIComponent(
    frontMatter.ogTitle || frontMatter.title || title,
  );
  const ogImageUrl = `${BASE_URL}/api/og?title=${imgTitle}`;

  return (
    <div className="relative grid grid-cols-12">
      <Head>
        <link href="/favicon.svg" rel="icon" />
        <title>{`${title} • Triplex`}</title>
        <meta content={title} property="og:title" />
        {frontMatter.description && (
          <>
            <meta content={frontMatter.description} property="og:description" />
            <meta
              content={frontMatter.description}
              name="twitter:description"
            />
          </>
        )}
        <meta content={ogImageUrl} property="og:image" />
        <meta content="summary_large_image" name="twitter:card" />
        <meta content={ogImageUrl} name="twitter:image" />
        <meta content="@_douges" name="twitter:site" />
        <meta content={title} name="twitter:title" />
      </Head>

      <Layout
        pageOpts={pageOpts}
        pageProps={pageProps}
        themeConfig={themeConfig}
      >
        <MDXProvider components={components}>{children}</MDXProvider>
      </Layout>
    </div>
  );
}
