/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { useLayoutEffect, useRef, useState } from "react";
import { InlineVideo } from "./video";

export function LandingVideo() {
  const [isExpanded, setIsExpanded] = useState(false);
  const ref = useRef<HTMLDialogElement>(null!);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    if (isExpanded) {
      element.showModal();
    }

    function onEscapePressHandler(e: Event) {
      e.preventDefault();
      setIsExpanded(false);
    }

    function onClickBlanketHandler(e: MouseEvent) {
      if (e.target === ref.current) {
        ref.current.close();
        setIsExpanded(false);
      }
    }

    element.addEventListener("cancel", onEscapePressHandler);
    element.addEventListener("click", onClickBlanketHandler);

    return () => {
      element.removeEventListener("cancel", onEscapePressHandler);
      element.removeEventListener("click", onClickBlanketHandler);
    };
  }, [isExpanded]);

  if (isExpanded) {
    return (
      <dialog
        className="border-neutral bg-surface backdrop:bg-surface m-auto aspect-video h-auto w-11/12 border backdrop:opacity-80 focus-visible:outline-none md:max-w-5xl"
        ref={ref}
      >
        <div className="absolute inset-0"></div>
      </dialog>
    );
  }

  return (
    <button
      className="absolute inset-0 cursor-pointer"
      onClick={() => setIsExpanded(true)}
      type="button"
    >
      <span className="sr-only">Watch the video on how Triplex works</span>
      <InlineVideo
        src={{
          dark: "/videos/hero-preview-dark.mp4",
          light: "/videos/hero-preview-light.mp4",
        }}
      />
      <div className="hover:bg-hovered active:bg-pressed absolute inset-0 rounded-xl" />
    </button>
  );
}
