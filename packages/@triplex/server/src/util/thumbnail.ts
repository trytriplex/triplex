/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
export async function getThumbnailPath({
  exportName,
  path,
}: {
  exportName: string;
  path: string;
}): Promise<string> {
  if (!process.send) {
    throw new Error("invariant: ipc unavailable");
  }

  process.send({
    data: {
      exportName,
      path,
    },
    eventName: "thumbnail",
  });

  return new Promise((resolve) => {
    const callback = ({
      data,
      eventName,
    }: {
      data: Record<string, unknown>;
      eventName: string;
    }) => {
      if (
        eventName === "response:thumbnail" &&
        data.exportName === exportName &&
        data.path === path &&
        typeof data.thumbnailPath === "string"
      ) {
        resolve(data.thumbnailPath);
        process.off("message", callback);
      }
    };

    process.on("message", callback);
  });
}

export function invalidateThumbnail({
  exportName,
  path,
}: {
  exportName: string;
  path: string;
}) {
  if (!process.send) {
    throw new Error("invariant: ipc unavailable");
  }

  process.send({
    data: {
      exportName,
      path,
    },
    eventName: "invalidate-thumbnail",
  });
}
