/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
export async function getPort(from?: number, to: number | undefined = from) {
  const { default: getPort, portNumbers } = await import("get-port");

  return await getPort({
    port: from && to ? portNumbers(from, to) : undefined,
  });
}
