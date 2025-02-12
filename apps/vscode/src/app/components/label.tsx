/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { cn } from "@triplex/lib";

function descriptionWithTags(
  description?: string,
  tags?: Record<string, string | number | boolean>,
) {
  const formattedTags =
    tags &&
    Object.entries(tags)
      .map(([key, value]) => `@${key} ${value}`)
      .join("\n");
  const label = [description, formattedTags].filter(Boolean);
  return label.join("\n\n") || undefined;
}

export function Label({
  children,
  description,
  htmlFor,
  tags,
}: {
  children?: string;
  description?: string;
  htmlFor: string;
  tags: Record<string, string | number | boolean> | undefined;
}) {
  if (children === undefined) {
    // We return an empty div so we keep union input
    // grid layouts functional and have the label take
    // the first grid item using the auto placement.
    // See: https://github.com/trytriplex/triplex-monorepo/blob/4ab74c910ebbe67673b3a20baa9e377600380e7d/apps/vscode/src/app/features/panels/inputs.tsx#L194
    return <div />;
  }

  const label = descriptionWithTags(description, tags);

  return (
    <div
      className={cn([
        "col-span-2 mt-1 overflow-hidden text-ellipsis",
        !!label && "italic",
      ])}
    >
      <label htmlFor={htmlFor} title={label}>
        {children}
      </label>
    </div>
  );
}
