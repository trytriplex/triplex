/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
    <div className={cn(["col-span-2 mt-1", !!label && "italic"])}>
      <label htmlFor={htmlFor} title={label}>
        {children}
      </label>
    </div>
  );
}
