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
import Image from "next/image";
import Link from "next/link";
import type { NextraThemeLayoutProps } from "nextra";
import { normalizePages } from "nextra/normalize-pages";
import { Fragment, useEffect, useMemo, useState } from "react";
import { SendFeedback } from "../components/feedback";
import { Footer } from "../components/footer";
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
        <div className="fixed left-0 right-0 top-14 z-40 max-h-[calc(100vh-3.5rem)] overflow-auto border-b border-neutral-600 bg-neutral-950/50 px-6 py-6 text-white [backdrop-filter:saturate(200%)_blur(5px)] md:hidden">
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
            <hr className="-mx-2 my-6 border-neutral-600" />
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
            className="relative -mx-6 flex border-b border-t border-neutral-600 md:mx-0 md:mt-8 md:border"
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
                <div className="flex flex-wrap items-center gap-0.5">
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
              <h1 className="flex flex-wrap items-center gap-2 text-3xl font-bold text-neutral-200 lg:text-4xl">
                {title}
                {frontMatter.app && (
                  <div
                    className="inline-block rounded bg-white/10 px-1 py-0.5 text-xs font-normal text-neutral-400"
                    title={`Only available in ${frontMatter.app}.`}
                  >
                    {frontMatter.app}
                  </div>
                )}
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
              <div className="mt-10 flex flex-col gap-10 border-t border-neutral-600 pt-8 lg:mt-20 lg:pt-12">
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
                <div className="mt-2 border-t border-neutral-600 pt-3">
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
