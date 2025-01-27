/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export function createCodeLink(
  path: string,
  { column, line }: { column: number; line: number },
) {
  const data = {
    column,
    line,
    path,
  };

  const encodedArgs = encodeURIComponent(JSON.stringify([data]));

  return encodeURI(`command:triplex.open-file?${encodedArgs}`);
}
