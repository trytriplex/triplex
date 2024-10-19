/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
