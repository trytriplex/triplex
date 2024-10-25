/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { CodeIcon, FileTextIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMDXComponents, type Components } from "nextra/mdx";
import { ActionLink } from "../components/button-example";
import { KnowledgeCallout } from "../components/callouts";

export const components: Components = {
  ActionLink,
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
      <code className="border border-neutral-700 px-1.5 py-0.5 font-mono text-neutral-300">
        {children}
      </code>
    ) : (
      // Code block powered by shiki
      // See: https://shiki.matsu.io/guide/theme-colors#css-variables-theme
      <code className="[--shiki-color-text:#ccfbf1] [--shiki-token-comment:#16a34a] [--shiki-token-constant:#5eead4] [--shiki-token-function:#5eead4] [--shiki-token-keyword:#60a5fa] [--shiki-token-link:#facc15] [--shiki-token-parameter:#9ca3af] [--shiki-token-punctuation:#2dd4bf] [--shiki-token-string-expression:#fda4af] [&:has(.highlighted)_:not(.highlighted):not(.line)]:opacity-40 [&_.highlighted>*]:!opacity-100 [&_.highlighted]:bg-white/5 [&_.line.highlighted]:float-left [&_.line.highlighted]:w-full">
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
          <div className="flex items-center gap-2.5 border border-b-0 border-neutral-700 bg-white/5 py-2 pl-3">
            <span className="rounded border border-neutral-600 p-1">
              {props.filename.endsWith(".tsx") ? (
                <CodeIcon className="text-neutral-300" />
              ) : (
                <FileTextIcon className="text-neutral-300" />
              )}
            </span>
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
