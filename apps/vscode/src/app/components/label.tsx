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
  children: string;
  description?: string;
  htmlFor: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} title={description}>
        {children}
      </label>
    </div>
  );
}
