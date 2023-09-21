/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import Head from "next/head";
import type { NextraThemeLayoutProps } from "nextra";
import Link from "next/link";
import {
  Fragment,
  MouseEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MDXProvider, Components } from "nextra/mdx";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { Footer } from "../components/footer";
import { normalizePages } from "nextra/normalize-pages";
import { Header, HeaderItem } from "../components/header";
import { cn } from "../util/cn";
import { useSearchStore } from "../stores/search";
import { BASE_URL } from "../util/url";

const components: Components = {
  h1: () => (
    <i className="text-red-400">Define title frontmatter instead of heading</i>
  ),
  h2: ({ children, id }) => (
    <h2
      id={id}
      className="mt-14 text-4xl font-extrabold tracking-tight text-neutral-200"
    >
      {children}
    </h2>
  ),
  h3: ({ children, id }) => (
    <h3
      id={id}
      className="mt-10 text-2xl font-extrabold tracking-tight text-neutral-200"
    >
      {children}
    </h3>
  ),
  h4: ({ children, id }) => (
    <h4
      id={id}
      className="mt-6 text-xl font-extrabold tracking-tight text-neutral-200"
    >
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="mt-6 text-xl text-neutral-300 md:text-lg">{children}</p>
  ),
  ul: ({ children }) => <ul className="mt-8 list-disc">{children}</ul>,
  ol: ({ children }) => <ol className="mt-8 list-decimal">{children}</ol>,
  li: ({ children }) => (
    <li className="ml-4 text-xl text-neutral-300 md:text-lg">{children}</li>
  ),
  a: ({ children, href }) => (
    <Link href={href || ""} className="text-blue-400 underline">
      {children}
    </Link>
  ),
  pre: ({ children }) => (
    <pre className="mt-5 whitespace-break-spaces rounded-xl bg-white/5 p-3 text-lg text-neutral-300 md:text-base">
      {children}
    </pre>
  ),
  code: ({ children }) =>
    typeof children === "string" ? (
      <code className="text rounded bg-white/10 px-1.5 py-0.5">{children}</code>
    ) : (
      <code>{children}</code>
    ),
  th: ({ children }) => (
    <th className="text-left text-neutral-400">{children}</th>
  ),
  table: ({ children }) => <table className="mt-5">{children}</table>,
  td: ({ children }) => <td className="text-neutral-300">{children}</td>,
  Video: ({ src }) => (
    <video className="mt-8 w-full rounded-xl" controls src={src} />
  ),
};

const friendlyDate = (date: string): string => {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

function renderDocsItem(
  link: ReturnType<typeof normalizePages>["docsDirectories"][0],
  route: string,
  level = 0
): JSX.Element | null {
  if (!link.isUnderCurrentDocsTree) {
    return null;
  }

  if (link.type === "separator") {
    return <div key={link.name} className="h-6" />;
  }

  const url =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    link.firstChildRoute || (link as any).href || link.route;

  if (link.kind === "Folder") {
    return (
      <Fragment key={url}>
        <div className="mt-6 pl-10 text-base font-bold text-neutral-200">
          {link.title}
        </div>
        {link.children &&
          link.children.map((item) => renderDocsItem(item, route, level + 1))}
      </Fragment>
    );
  }

  return (
    <Fragment key={url}>
      <Link
        className={cn([
          route === url
            ? "text-blue-400"
            : "text-neutral-300 hover:text-neutral-100",
          "block overflow-hidden text-ellipsis whitespace-nowrap rounded py-1 pl-10 pr-6 text-base",
        ])}
        href={url}
      >
        {link.title}
      </Link>
    </Fragment>
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

    return foundResults;
  }, [filter, index]);

  useEffect(() => {
    async function prepIndex() {
      const { default: FlexSearch } = await import("flexsearch");

      if (index) {
        return;
      }

      const newIndex = new FlexSearch.Document<SearchResult, SearchResultKeys>({
        cache: 100,
        tokenize: "full",
        document: {
          id: "id",
          index: ["title", "content"],
          store: ["title", "route", "id"],
        },
        context: {
          resolution: 9,
          depth: 2,
          bidirectional: true,
        },
      });

      pages.forEach((page) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const route = (page as any).href || page.route;

        const document = {
          id: route + page.title,
          title: page.title,
          route,
          content: "",
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
      ref={ref}
      className="m-auto mt-10 w-full rounded-lg border border-neutral-700 bg-neutral-950 p-0 backdrop:bg-black/70 md:mt-32 md:max-w-2xl"
    >
      <form method="dialog">
        <div className="flex items-center">
          <input
            type="text"
            onChange={(e) => setFilter(e.target.value)}
            className="w-full rounded bg-transparent px-4 py-4 text-lg text-neutral-200 placeholder:text-neutral-400 focus:outline-none md:text-base"
            placeholder="Search documentation..."
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

function Layout({ pageOpts, children }: NextraThemeLayoutProps) {
  const { title, pageMap, frontMatter, headings, route } = pageOpts;

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
    [pageMap, route]
  );

  const previousPage = result.flatDocsDirectories[result.activeIndex - 1];
  const nextPage = result.flatDocsDirectories[result.activeIndex + 1];
  const pageItems = result.flatDocsDirectories.filter(
    (item) => item.isUnderCurrentDocsTree
  );

  useEffect(() => {
    setNavOpen(false);
  }, [route]);

  return (
    <>
      <Header
        appearance={route === "/" ? "transparent" : "default"}
        onShowNav={() => setNavOpen((prev) => !prev)}
      >
        {result.topLevelNavbarItems.map((item) => (
          <HeaderItem
            key={item.title}
            href={item.children?.[0].route || item.href || item.route}
          >
            {item.title}
          </HeaderItem>
        ))}
      </Header>

      {isNavMenuOpen && (
        <div className="absolute left-0 right-0 top-16 z-50 border-b border-neutral-900 bg-neutral-950 px-10 py-6 text-white md:hidden">
          {result.topLevelNavbarItems.map((item) => (
            <div key={item.title} className="mb-2">
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
            <div key={item.title} className="mb-2">
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

      {result.activeThemeContext.layout !== "raw" && (
        <nav
          aria-label="pages navigation"
          className="col-span-3 hidden w-full max-w-[280px] justify-self-end md:block"
        >
          <div className="sticky top-10">
            {result.docsDirectories.map((item) => renderDocsItem(item, route))}
          </div>
        </nav>
      )}

      <main
        className={cn([
          route === "/" ? "row-start-1" : "",
          "relative",
          result.activeThemeContext.layout === "raw"
            ? "col-span-full"
            : "col-span-full max-w-5xl px-10 md:col-span-8 md:p-0 xl:col-span-6",
        ])}
      >
        {result.activeThemeContext.layout !== "raw" && (
          <>
            <h1 className="text-6xl font-extrabold tracking-tight text-neutral-300">
              {title}
            </h1>
            {frontMatter.date && (
              <>
                (
                <time className="text-neutral-400" dateTime={frontMatter.date}>
                  {friendlyDate(frontMatter.date)}
                </time>
                <span className="text-neutral-400"> · </span>
                <a
                  className="text-neutral-400 hover:text-neutral-200"
                  href="https://twitter.com/_douges"
                  target="_blank"
                >
                  Michael Dougall
                </a>
                )
              </>
            )}
          </>
        )}

        {children}

        {result.activeThemeContext.layout !== "raw" &&
          result.activeThemeContext.pagination !== false && (
            <nav aria-label="page navigation" className="flex pt-14">
              {previousPage && (
                <div className="flex items-center gap-2">
                  <ArrowLeftIcon className="text-neutral-400" />
                  <Link
                    className="text-2xl font-bold text-neutral-300 md:text-xl"
                    href={previousPage.route}
                  >
                    {previousPage.title}
                  </Link>
                </div>
              )}
              {nextPage && nextPage.route !== "#" && (
                <div className="ml-auto flex items-center gap-2">
                  <Link
                    className="text-2xl font-bold text-neutral-300 md:text-xl"
                    href={nextPage.route}
                  >
                    {nextPage.title}
                  </Link>
                  <ArrowRightIcon className="text-neutral-400" />
                </div>
              )}
            </nav>
          )}
      </main>

      {result.activeThemeContext.layout !== "raw" && headings.length && (
        <nav
          aria-label="page contents"
          className="col-span-3 hidden justify-self-start pr-10 xl:block"
        >
          <div className="sticky top-10">
            <span className="text-sm font-extrabold text-neutral-300">
              Content
            </span>
            {headings.map((h) => (
              <div style={{ paddingLeft: (h.depth - 2) * 8 }} key={h.id}>
                <Link
                  className="text-sm text-neutral-300 hover:text-neutral-100"
                  href={`#${h.id}`}
                >
                  {h.value}
                </Link>
              </div>
            ))}
          </div>
        </nav>
      )}

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
  const { title, frontMatter } = pageOpts;

  const imgTitle = encodeURIComponent(frontMatter.ogTitle || title);
  const imgDate = frontMatter.date
    ? encodeURIComponent(friendlyDate(frontMatter.date))
    : "";
  const imgSubTitle = encodeURIComponent(frontMatter.description || "");
  const ogImageUrl = `${BASE_URL}/api/og?title=${imgTitle}&subtitle=${imgSubTitle}&date=${imgDate}`;

  return (
    <div className="relative grid grid-cols-12 gap-x-10 gap-y-20">
      <Head>
        <title>{title}</title>
        <meta property="og:title" content={title} />
        {frontMatter.description && (
          <>
            <meta property="og:description" content={frontMatter.description} />
            <meta
              name="twitter:description"
              content={frontMatter.description}
            />
          </>
        )}
        <meta property="og:image" content={ogImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImageUrl} />
        <meta name="twitter:site" content="@_douges" />
        <meta name="twitter:title" content={title} />
      </Head>

      <Layout
        pageProps={pageProps}
        themeConfig={themeConfig}
        pageOpts={pageOpts}
      >
        <MDXProvider components={components}>{children}</MDXProvider>
      </Layout>
    </div>
  );
}
