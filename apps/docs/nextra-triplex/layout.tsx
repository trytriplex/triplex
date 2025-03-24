/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import Image from "next/image";
import Link from "next/link";
// @ts-ignore
import type { NextraThemeLayoutProps } from "nextra";
import { normalizePages } from "nextra/normalize-pages";
import { Fragment, useEffect, useMemo, useState, type JSX } from "react";
import { SendFeedback } from "../components/feedback";
import { Footer } from "../components/footer";
import { BgGrid, GridContainer } from "../components/grid";
import { Header, HeaderItem } from "../components/header";
import { PagesList } from "../components/pages-list";
import { useSearchStore } from "../stores/search";
import { cn } from "../util/cn";
import { friendlyDate } from "../util/date";
import socials from "../util/socials.json";
import { SearchModal } from "./search-modal";
import { SideNavItem } from "./side-nav-item";

function hasSelectedChild(
  item: ReturnType<typeof normalizePages>["docsDirectories"][0],
  route: string,
): boolean {
  if (!item.children) {
    return false;
  }

  return item.children.some((child) => {
    if (child.route === route) {
      return true;
    }

    return hasSelectedChild(child, route);
  });
}

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
        <div className="text-default mt-6 py-1.5 text-base font-medium">
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
      isChildSelected={hasSelectedChild(link, route)}
      isSelected={route === url}
      key={url}
      level={level}
      title={link.title}
    >
      {link.children &&
        !!link.children.length &&
        link.children.map((item) => renderDocsItem(item, route, level + 1))}
    </SideNavItem>
  );
}

export function Layout({ children, pageOpts }: NextraThemeLayoutProps) {
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
  const hasPageAuthorOrDate = !!frontMatter.date || !!frontMatter.author;
  const authorSocials =
    frontMatter.author in socials
      ? socials[frontMatter.author as keyof typeof socials]
      : undefined;

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
        <div className="text-brand bg-surface border-neutral fixed left-0 right-0 top-14 z-40 max-h-[calc(100vh-3.5rem)] overflow-auto border-b px-6 py-6 md:hidden">
          {result.topLevelNavbarItems.map((item) => (
            <div className="mb-2" key={item.title}>
              <Link
                className="hover:text-default text-subtle text-xl"
                href={item.href || item.firstChildRoute || item.route}
              >
                {item.title}
              </Link>
            </div>
          ))}

          {pageItems.length > 0 ? (
            <hr className="border-neutral -mx-2 my-6" />
          ) : null}

          {pageItems.map((item) => (
            <div className="mb-2" key={item.title}>
              <Link
                className="hover:text-default text-subtle text-xl"
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
          className="col-span-3 hidden w-full pr-10 pt-6 md:block md:pb-10 lg:pb-10"
        >
          <div className="sticky top-12 flex flex-col items-start pl-6 md:pl-8 lg:pl-20">
            {result.docsDirectories.map((item) => renderDocsItem(item, route))}
          </div>
        </nav>
      )}

      <main
        className={cn([
          "relative w-full",
          result.activeThemeContext.layout === "raw" &&
            "col-span-full mx-auto max-w-screen-2xl px-8 lg:px-20",
          result.activeThemeContext.layout === "default" &&
            "col-span-full px-6 md:col-span-9 md:pl-0 md:pr-8 lg:pr-20",
          result.activeThemeContext.layout === "full" &&
            "col-span-full mx-auto w-full max-w-7xl px-6",
        ])}
      >
        {result.activeThemeContext.layout !== "raw" && (
          <GridContainer
            className="border-neutral relative -mx-6 flex border-b border-t md:mx-0 md:mt-8 md:border"
            size={100}
          >
            <BgGrid
              className="relative flex basis-2/3 flex-col justify-center gap-2 px-6 py-8 md:min-h-[16rem] md:px-14 md:py-14 lg:min-h-[20rem] lg:basis-3/5"
              variant="lines"
            >
              {hasPageAuthorOrDate && (
                <div className="flex flex-wrap items-center gap-x-2">
                  {authorSocials && (
                    <a
                      className="hover:text-default text-subtlest flex items-center gap-0.5 text-base underline"
                      href={authorSocials.url || "#"}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Image
                        alt=""
                        className="bg-neutral border-neutral mr-1 h-6 w-6 rounded-full border"
                        height={20}
                        src={authorSocials.avatar}
                        width={20}
                      />
                      {frontMatter.author}
                    </a>
                  )}
                  {frontMatter.author && frontMatter.date && (
                    <span className="text-subtlest text-base"> · </span>
                  )}
                  {frontMatter.date && (
                    <time
                      className="text-subtlest text-base"
                      dateTime={frontMatter.date}
                      title={frontMatter.date}
                    >
                      {friendlyDate(frontMatter.date)}
                    </time>
                  )}
                </div>
              )}
              {!hasPageAuthorOrDate && result.activeThemeContext.breadcrumb && (
                <div className="flex flex-wrap items-center gap-0.5">
                  {result.activePath.map((path, index) =>
                    index === 0 ? null : (
                      <Fragment key={path.route}>
                        <Link
                          className="hover:text-subtlest text-subtlest text-base"
                          href={path.kind === "MdxPage" ? path.route : ""}
                        >
                          {path.title}
                        </Link>
                        {index !== result.activePath.length - 1 && (
                          <ChevronRightIcon className="text-subtlest" />
                        )}
                      </Fragment>
                    ),
                  )}
                </div>
              )}
              <h1 className="text-default font-brand flex flex-wrap items-center gap-2 text-3xl font-medium lg:text-4xl lg:font-semibold">
                {title}
                {frontMatter.app && (
                  <div
                    className="text-subtlest bg-neutral inline-block rounded px-1 py-0.5 text-xs font-normal"
                    title={`Only available in ${frontMatter.app}.`}
                  >
                    {frontMatter.app}
                  </div>
                )}
              </h1>
              {frontMatter.description && (
                <div className="text-subtle text-lg">
                  {frontMatter.description}
                </div>
              )}
            </BgGrid>
            <div className="relative basis-1/2 overflow-hidden">
              <BgGrid
                className="absolute -left-full bottom-0 right-0 top-0"
                variant="transparent"
              />
              {frontMatter.image && (
                <div
                  className={cn([
                    "absolute inset-0 overflow-hidden",
                    frontMatter.imageLayout === "cover" && "pl-6 pt-6",
                    frontMatter.imageLayout !== "cover" && "p-6",
                  ])}
                >
                  <Image
                    alt=""
                    className={cn([
                      frontMatter.imageLayout === "cover" &&
                        "h-[600px] object-cover",
                      frontMatter.imageLayout !== "cover" &&
                        "h-full object-contain",
                      "w-full rounded-none object-left",
                    ])}
                    height={800}
                    src={frontMatter.image}
                    width={800}
                  />
                </div>
              )}
            </div>
            <div className="border-surface pointer-events-none absolute inset-0 border-4" />
          </GridContainer>
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
                "col-span-full xl:col-span-9 [&>*:first-child]:mt-0",
            ])}
          >
            {children}

            {result.activeThemeContext.layout !== "raw" &&
              "childLinks" in result.activeThemeContext &&
              !!result.activeThemeContext.childLinks && (
                <PagesList variant="grid" />
              )}

            {(result.activeThemeContext.pagination ||
              ("feedback" in result.activeThemeContext &&
                typeof result.activeThemeContext.feedback === "boolean" &&
                result.activeThemeContext.feedback)) && (
              <div className="border-neutral mt-10 flex flex-col gap-10 border-t pt-8 lg:mt-20 lg:pt-12">
                {result.activeThemeContext.pagination && (
                  <nav aria-label="pages navigation" className="flex">
                    {previousPage && (
                      <div className="flex flex-col">
                        <span className="text-subtlest -mb-0.5 ml-[15px] pl-2 text-sm">
                          Previous
                        </span>
                        <Link
                          className="hover:text-default text-subtle flex items-center gap-2 text-xl md:text-lg"
                          href={previousPage.route}
                        >
                          <ArrowLeftIcon className="text-subtlest" />
                          {previousPage.title}
                        </Link>
                      </div>
                    )}
                    {nextPage && nextPage.route !== "#" && (
                      <div className="ml-auto flex flex-col">
                        <span className="text-subtlest -mb-0.5 text-sm">
                          Next
                        </span>
                        <Link
                          className="hover:text-default text-subtle flex items-center gap-2 text-xl md:text-lg"
                          href={nextPage.route}
                        >
                          {nextPage.title}
                          <ArrowRightIcon className="text-subtlest" />
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
              <div className="sticky top-20 flex flex-col gap-3">
                <span className="text-subtle text-sm font-medium">
                  On this page
                </span>
                {headings.map(
                  (h: { depth: number; id: string; value: string }) => (
                    <div key={h.id} style={{ paddingLeft: (h.depth - 2) * 8 }}>
                      <Link
                        className="text-subtlest hover:text-default text-sm"
                        href={`#${h.id}`}
                      >
                        {h.value}
                      </Link>
                    </div>
                  ),
                )}
                <div className="border-neutral mt-1 border-t pt-4">
                  <a
                    className="text-subtlest hover:text-subtle text-sm"
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
