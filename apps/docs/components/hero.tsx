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
import { BgGrid } from "./grid";

export function BigDownloadLink({ variant }: { variant: "outline" | "bold" }) {
  return (
    <Link
      className={cn([
        variant === "outline" && "text-brand border-brand border-2",
        variant === "bold" && "bg-brand text-inverse",
        "flex items-center justify-center px-10 py-6 font-mono text-3xl font-medium md:px-16 md:py-8 md:text-5xl",
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
      className="relative whitespace-nowrap px-12 py-0.5 [transition:transform_cubic-bezier(0.8,0,0,0.8)_0.5s]"
      style={style}
    >
      <span className="bg-neutral absolute inset-0 scale-90" />
      <BgGrid
        className="border-neutral absolute inset-0 scale-90 border"
        size={40}
        variant="lines"
      />
      <span
        className={cn(["relative font-semibold", isHidden && "select-none"])}
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
      className="relative flex h-[75lvh] min-h-[400px] items-center"
      id="hero-section"
    >
      <div className="w-full px-10 xl:px-28">
        <div className="flex flex-col items-center gap-4 lg:gap-6">
          <div className="text-center">
            <Link
              className="text-subtle bg-neutral border-neutral z-10 rounded-full border box-decoration-clone px-3 py-1 text-center font-mono text-sm"
              href="/blog/triplex-for-vscode"
            >
              Triplex for VS Code now available
            </Link>
          </div>

          <h1 className="text-default font-brand max-w-2xl text-center text-6xl font-medium lg:max-w-4xl lg:text-7xl">
            The Visual IDE for the
            <FlashCards
              values={[
                "Dynamic",
                "Virtual",
                "Gaming",
                "Quirky",
                "Shared",
                "Future",
                "Spatial",
              ]}
            />
            Web.
          </h1>

          <div className="z-10 flex flex-col items-center gap-2">
            <a
              className="text-inverse bg-brand z-10 cursor-pointer px-8 py-4 text-center font-mono text-2xl font-medium"
              href="https://marketplace.visualstudio.com/items?itemName=trytriplex.triplex-vsce"
              onClick={(e) => {
                beginDownload(e, "/docs/get-started?dl=vsce");
              }}
            >
              Install for Visual Studio Code
            </a>

            <span className="text-subtle font-default text-center text-base">
              <DownloadButton variant="link" />, or for{" "}
              <Link
                className="hover:text-default text-subtle underline"
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
