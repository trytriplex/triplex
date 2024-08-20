/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export function Label({
  children,
  description,
  htmlFor,
}: {
  children?: string;
  description?: string;
  htmlFor: string;
}) {
  if (children === undefined) {
    // We return an empty div so we keep union input
    // grid layouts functional and have the label take
    // the first grid item using the auto placement.
    // See: https://github.com/try-triplex/triplex-monorepo/blob/4ab74c910ebbe67673b3a20baa9e377600380e7d/apps/vscode/src/app/features/panels/inputs.tsx#L194
    return <div />;
  }

  return (
    <div className="col-span-2 mt-1">
      <label htmlFor={htmlFor} title={description}>
        {children}
      </label>
    </div>
  );
}
