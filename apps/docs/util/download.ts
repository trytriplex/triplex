/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useRouter } from "next/router";
import { type MouseEvent } from "react";

export function useBeginDownloadURL() {
  const router = useRouter();

  return (e: MouseEvent<HTMLAnchorElement>, nextURL: string) => {
    e.preventDefault();
    router.push(nextURL);
    const href = e.currentTarget.href;
    setTimeout(() => window.open(href, "_blank"), 1000);
  };
}
