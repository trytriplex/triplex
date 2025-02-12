/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
