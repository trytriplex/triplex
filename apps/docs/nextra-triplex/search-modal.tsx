/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import Link from "next/link";
import { type normalizePages } from "nextra/normalize-pages";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEventHandler,
} from "react";

interface SearchResult {
  id: string;
  route: string;
  title: string;
}

type SearchResultKeys = (keyof SearchResult)[];

export function SearchModal({
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
      className="border-neutral bg-surface backdrop:bg-surface m-auto mt-10 w-full rounded-lg border p-0 backdrop:opacity-80 md:mt-32 md:max-w-2xl"
      ref={ref}
    >
      <form method="dialog">
        <div className="flex items-center">
          <input
            className="text-default placeholder:text-subtlest w-full rounded bg-transparent px-4 py-4 text-lg focus:outline-none md:text-lg"
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search documentation..."
            type="text"
          />

          <div className="text-subtlest border-neutral bg-neutral mr-4 rounded border px-1.5 py-0.5 text-xs md:block">
            ESC
          </div>
        </div>
      </form>

      {searchResults.length > 0 && (
        <div
          className="border-neutral flex flex-col border-t py-1.5"
          onClick={onSearchResultClickHandler}
        >
          {searchResults.map((res) => (
            <Link
              className="text-subtle hover:bg-hovered active:bg-pressed px-4 py-1 text-lg md:text-base"
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
