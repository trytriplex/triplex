/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import Link from "next/link";
import { useBeginDownloadURL } from "../util/download";
import { DownloadButton } from "./download-button";
import { LandingVideo } from "./landing-video";

export function LandingHero() {
  const beginDownload = useBeginDownloadURL();

  return (
    <div>
      <h1 className="font-brand text-brand max-w-2xl text-6xl font-medium sm:text-7xl lg:max-w-4xl lg:text-8xl">
        Visual development environment for React
      </h1>

      <div className="relative mt-20 md:mt-28">
        <div className="bg-neutral relative -mx-8 h-60 md:mx-0 md:h-80 md:rounded-[62px] lg:h-96"></div>
        <div className="bg-surface border-neutral absolute -top-12 left-[10%] right-[10%] mx-auto aspect-video max-w-sm border md:-top-20 md:left-auto md:w-1/2 md:min-w-[430px] md:max-w-none lg:-top-40 lg:w-2/5">
          <div className="absolute -top-20 left-0 right-0 hidden flex-col items-center gap-2 xl:flex">
            <div className="text-default select-none font-mono text-base font-medium">
              See how it works
            </div>
            <div className="border-neutral h-8 border-r" />
          </div>
          <LandingVideo />
        </div>
      </div>

      <div className="mt-8 flex flex-col items-stretch justify-center gap-2 md:-mt-8 md:items-center">
        <a
          className="bg-brand text-inverse font-default relative flex cursor-pointer items-center justify-center px-8 py-4 text-center text-xl font-medium md:text-2xl"
          href="https://marketplace.visualstudio.com/items?itemName=trytriplex.triplex-vsce"
          onClick={(e) => {
            beginDownload(e, "/docs/get-started?dl=vsce");
          }}
        >
          Install for Visual Studio Code / Cursor
        </a>
        <div className="text-subtle items-center self-center text-base">
          <DownloadButton variant="link" />, or for{" "}
          <Link
            className="hover:text-default cursor-pointer underline"
            href="/download"
          >
            other platforms
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
