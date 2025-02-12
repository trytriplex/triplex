/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import getOriginRemoteURL from "git-remote-origin-url";
import { fromUrl } from "hosted-git-info";

export async function resolveGitRepoVisibility(
  cwd: string,
): Promise<{ url: string; visibility: "public" | "private" | "unknown" }> {
  let remoteURL: string;

  try {
    remoteURL = await getOriginRemoteURL(cwd);
  } catch {
    remoteURL = "";
  }

  if (!remoteURL) {
    return { url: "", visibility: "unknown" };
  }

  const gitInfo = fromUrl(remoteURL);
  const url = gitInfo?.https({ noGitPlus: true });

  if (!url) {
    return { url: remoteURL, visibility: "unknown" };
  }

  const visibility: "public" | "private" | "unknown" = await fetch(url)
    .then((res) => (res.ok ? "public" : "private"))
    .catch(() => "unknown");

  return {
    url,
    visibility,
  };
}
