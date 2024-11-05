/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "../util/cn";
import { useBeginDownloadURL } from "../util/download";
import { useVisibilityState } from "../util/hooks";
import { DownloadButton } from "./download-button";

export function BigDownloadLink({ variant }: { variant: "outline" | "bold" }) {
  return (
    <Link
      className={cn([
        variant === "outline" && "border-2 border-blue-400 text-blue-400",
        variant === "bold" && "bg-blue-400 text-black/90",
        "flex items-center justify-center px-10 py-6 text-2xl font-bold md:px-16 md:py-8 md:text-4xl",
      ])}
      href="/download"
    >
      Download Now
    </Link>
  );
}

function FlashCard({
  isHidden,
  style,
  value,
}: {
  isHidden: boolean;
  style: { transform?: string; transition?: string };
  value: string;
}) {
  return (
    <span
      aria-hidden={isHidden}
      className="relative whitespace-nowrap px-12 py-0.5 [text-shadow:none] [transition:transform_cubic-bezier(0.8,0,0,0.8)_0.5s]"
      style={style}
    >
      <span className="absolute inset-0 scale-90 bg-neutral-950/90" />
      <span
        className="absolute inset-0 scale-90 border border-[#9d4b4b] [background:repeating-linear-gradient(transparent,transparent_var(--size),#292929_var(--size),#292929_calc(var(--size)+1px)),repeating-linear-gradient(to_right,transparent,transparent_var(--size),#292929_var(--size),#292929_calc(var(--size)+1px))]"
        style={{
          "--size": "40px",
        }}
      />
      <span
        className={cn([
          "relative font-mono font-semibold text-red-400",
          isHidden && "select-none",
        ])}
      >
        {value}
      </span>
    </span>
  );
}

function FlashCards({
  delay = 2000,
  values,
}: {
  delay?: number;
  values: string[];
}) {
  const gapBetweenCards = 2.5;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitions, setTransitions] = useState<"enabled" | "skip-next">(
    "enabled",
  );
  const visibilityState = useVisibilityState();

  useEffect(() => {
    if (visibilityState === "hidden") {
      // Skip the transition if the tab is not visible.
      return;
    }

    const timeoutId = setTimeout(() => {
      const nextValue = currentIndex + 1;
      if (nextValue > values.length) {
        // We're at the overflow now. We want to switch back to the first element
        // in the values index, skip the transition, and then start the transition in the
        // next frame moving to the next element.
        setTransitions("skip-next");
        setCurrentIndex(0);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTransitions("enabled");
            setCurrentIndex(1);
          });
        });
      } else {
        // We're not at the overflow yet, so we can just increment the index.
        setCurrentIndex(nextValue);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  });

  return (
    <div
      className="inline-flex flex-col overflow-hidden"
      style={{ gap: `${gapBetweenCards}rem`, height: "1.2em" }}
    >
      {values.concat(values[0]).map((value, index) => (
        <FlashCard
          isHidden={index !== currentIndex}
          key={value + index}
          style={{
            transform: currentIndex
              ? `translateY(calc(-${100 * currentIndex}% - ${gapBetweenCards * currentIndex}rem))`
              : undefined,
            transition: transitions === "skip-next" ? "none" : undefined,
          }}
          value={value}
        />
      ))}
    </div>
  );
}

export function Hero() {
  const beginDownload = useBeginDownloadURL();

  return (
    <div
      className="relative -mb-32 flex h-[75lvh] min-h-[400px] items-center"
      id="hero-section"
    >
      <div className="w-full px-10 xl:px-28">
        <div className="flex flex-col items-center gap-4 lg:gap-6">
          <Link
            className="z-10 rounded-full border border-pink-400 px-3 py-0.5 text-center font-mono text-sm text-pink-300 [text-shadow:black_1px_0_20px]"
            href="/blog/triplex-for-vscode"
          >
            Triplex for VS Code now available
          </Link>

          <h1 className="max-w-2xl text-center text-6xl font-bold text-neutral-200 [text-shadow:black_1px_0_50px] lg:max-w-3xl lg:text-7xl">
            The Visual IDE for the
            <FlashCards
              values={[
                "Dynamic",
                "Virtual",
                "Gaming",
                "Shared",
                "Future",
                "Spatial",
              ]}
            />
            Web.
          </h1>

          <div className="z-10 flex flex-col items-center gap-2">
            <DownloadButton />
            <span className="text-neutral-300">
              <a
                className="underline hover:text-neutral-100"
                href="https://marketplace.visualstudio.com/items?itemName=trytriplex.triplex-vsce"
                onClick={(e) => {
                  beginDownload(e, "/docs/get-started?dl=vsce");
                }}
                rel="noreferrer"
                target="_blank"
              >
                Install for VS Code
              </a>
              , or{" "}
              <Link
                className="underline hover:text-neutral-100"
                href="/download"
              >
                other platforms
              </Link>
              .
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
