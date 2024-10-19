/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useRouter } from "next/router";

export function DownloadThanks() {
  const router = useRouter();

  if (typeof router.query["dl"] !== "string") {
    return null;
  }

  const type = ["vsce", "winget"].includes(router.query["dl"])
    ? "installing"
    : "downloading";

  return (
    <div className="flex flex-col border border-green-800 bg-green-950/30 px-6 py-4 outline outline-2 -outline-offset-[3px] outline-neutral-950">
      <span className="text-2xl font-medium text-neutral-300">
        Thank you for {type} Triplex!
      </span>
      <span className="text-xl text-neutral-400 md:text-lg">
        Continue reading to learn more and get up and running.
      </span>
    </div>
  );
}
