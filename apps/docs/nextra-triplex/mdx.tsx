/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { CodeIcon, FileTextIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMDXComponents, type Components } from "nextra/mdx";
import { ActionLink } from "../components/button-example";
import { KnowledgeCallout, YouWillLearnCallout } from "../components/callouts";
import { PagesList } from "../components/pages-list";

export const components: Components = {
  ActionLink,
  Kbd: ({ children }) => (
    <kbd className="text-subtle border-neutral bg-neutral relative rounded border px-1.5 pb-0.5 pt-[3px] font-mono text-sm font-semibold after:absolute after:bottom-[-3px] after:left-[-1px] after:right-[-1px] after:top-0 after:rounded-md after:border-b-[3px] after:border-[inherit]">
      {children}
    </kbd>
  ),
  KnowledgeCallout,
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
      <pre className="text-subtle bg-neutral mt-5 whitespace-break-spaces rounded-xl p-3 text-lg md:text-base">
        <code>{code}</code>
      </pre>
    );
  },
  PagesList,
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
  YouWillLearnCallout,
  a: ({ children, href }) => (
    <Link className="text-link underline" href={href || ""}>
      {children}
    </Link>
  ),
  code: ({ children }) => {
    return typeof children === "string" ? (
      // Inline code
      <code className="text-subtle border-neutral border px-1.5 py-0.5 font-mono text-lg md:text-base">
        {children}
      </code>
    ) : (
      // Code block powered by shiki
      // See: https://shiki.matsu.io/guide/theme-colors#css-variables-theme
      <code className="[&_.line.highlighted]:after:border-brand [&_.highlighted]:bg-neutral leading-6 [&:has(.highlighted)_:not(.highlighted):not(.line)]:opacity-60 [&_.highlighted>*]:!opacity-100 [&_.line.highlighted]:relative [&_.line.highlighted]:float-left [&_.line.highlighted]:-ml-3 [&_.line.highlighted]:w-[calc(100%+24px)] [&_.line.highlighted]:pl-3 [&_.line.highlighted]:after:absolute [&_.line.highlighted]:after:bottom-0 [&_.line.highlighted]:after:left-[-1px] [&_.line.highlighted]:after:top-0 [&_.line.highlighted]:after:border-l">
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
        className="text-default inline scroll-m-20 text-3xl font-medium [&>code]:text-[length:inherit]"
        id={id}
      >
        {children}
      </h2>
    </div>
  ),
  h3: ({ children, id }) => (
    <div className="mt-10">
      <h3
        className="text-default inline scroll-m-20 text-2xl font-medium"
        id={id}
      >
        {children}
      </h3>
    </div>
  ),
  h4: ({ children, id }) => (
    <div className="mt-6">
      <h4
        className="text-default inline scroll-m-20 text-xl font-medium"
        id={id}
      >
        {children}
      </h4>
    </div>
  ),
  li: ({ children }) => (
    <li className="text-subtle ml-4 text-xl md:text-lg">{children}</li>
  ),
  ol: ({ children }) => <ol className="mt-5 list-decimal">{children}</ol>,
  p: ({ children }) => (
    <p className="text-subtle mt-5 text-xl md:text-lg">{children}</p>
  ),
  pre: ({ children, ...props }) => {
    const codeIcon = ["Terminal", ".tsx", ".jsx"];
    const filename =
      "filename" in props && typeof props.filename === "string"
        ? props.filename
        : "";

    return (
      <div className="mt-5">
        {filename && (
          <div className="border-neutral bg-neutral flex items-center gap-2.5 border border-b-0 py-2 pl-3">
            <span className="border-neutral rounded border p-1">
              {codeIcon.some((code) => filename.endsWith(code)) ? (
                <CodeIcon className="text-subtle" />
              ) : (
                <FileTextIcon className="text-subtle" />
              )}
            </span>
            <span className="text-subtle text-sm">{filename}</span>
          </div>
        )}
        <pre className="text-subtle border-neutral whitespace-break-spaces border p-3 text-sm">
          {children}
        </pre>
      </div>
    );
  },
  table: ({ children }) => (
    <table className="mt-5 w-full table-fixed">{children}</table>
  ),
  td: ({ children }) => (
    <td className="text-subtle border-neutral border-b p-2 text-base">
      {children}
    </td>
  ),
  th: ({ children }) => (
    <th className="text-default border-neutral border-b py-2.5 text-left text-base font-medium">
      {children}
    </th>
  ),
  ul: ({ children }) => <ul className="mt-5 list-disc">{children}</ul>,
};
