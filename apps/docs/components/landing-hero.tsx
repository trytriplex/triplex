/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { bind } from "bind-event-listener";
import Link from "next/link";
import { getPagesUnderRoute } from "nextra/context";
import rafSchd from "raf-schd";
import { useEffect, useRef } from "react";
import { useBeginDownloadURL } from "../util/download";
import { BgGrid } from "./grid";
import { LandingVideo } from "./landing-video";

export function LandingHero() {
  const beginDownload = useBeginDownloadURL();
  const ref = useRef<HTMLDivElement>(null);
  const latestBlog = getPagesUnderRoute("/blog")[0];

  useEffect(() => {
    return bind(document, {
      listener: rafSchd((e) => {
        if (!ref.current) {
          return;
        }

        // Update skew position based on mouse movement so it looks like the grid is following the cursor with some perspective.
        ref.current.style.transform = `perspective(1000px) rotateX(${
          (e.clientY / window.innerHeight - 0.5) * 10
        }deg) rotateY(${
          (e.clientX / window.innerWidth - 0.5) * 10
        }deg) rotateZ(0deg)`;
      }),
      type: "mousemove",
    });
  }, []);

  return (
    <div>
      <h1 className="font-brand text-brand max-w-2xl text-6xl font-medium sm:text-7xl lg:max-w-3xl lg:text-8xl">
        Build the 2D and 3D web without coding.
      </h1>
      <div className="h-8" />
      <Link
        className="text-subtle hover:text-default pl-0.5 font-mono text-base font-medium lg:text-lg"
        href={latestBlog.route}
      >
        Latest Blog: <span className="underline">{latestBlog.meta?.title}</span>
      </Link>
      <div className="relative mt-20 md:mt-28">
        <div className="bg-neutral group relative -mx-8 h-60 overflow-hidden md:mx-0 md:h-80 md:rounded-[62px] lg:h-96">
          <div className="absolute inset-0" ref={ref}>
            <BgGrid
              className="absolute -inset-10 opacity-100 transition-opacity group-hover:opacity-50"
              size={130}
              variant="lines"
            />
            <BgGrid
              className="absolute -inset-10 opacity-0 transition-opacity group-hover:opacity-60"
              size={130}
              variant="transparent"
            />
          </div>
        </div>
        <div className="bg-surface absolute -top-6 left-0 right-0 mx-auto box-content aspect-video max-w-sm rounded-xl md:-top-20 md:left-auto md:right-[6%] md:w-1/2 md:min-w-[430px] md:max-w-none lg:-top-40 lg:w-2/5">
          <div className="absolute -top-20 left-0 right-0 hidden flex-col items-center gap-1.5 md:flex">
            <div className="text-default bg-surface select-none rounded-full px-2 py-0.5 font-mono text-sm font-medium md:text-base">
              See how it works
            </div>
            <div className="border-neutral h-8 border-r" />
          </div>
          <LandingVideo />
        </div>
      </div>

      <div className="-mx-8 flex flex-col items-stretch justify-center gap-2 md:mx-0 md:-mt-8 md:items-center">
        <a
          className="bg-brand text-inverse font-default relative flex cursor-pointer items-center justify-center px-12 py-4 text-center text-xl font-medium md:text-2xl"
          href="https://marketplace.visualstudio.com/items?itemName=trytriplex.triplex-vsce"
          onClick={(e) => {
            beginDownload(e, "/docs/get-started?dl=vsce");
          }}
        >
          Install for Visual Studio Code
        </a>
      </div>
    </div>
  );
}
