/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useEffect, useRef } from "react";
import { cn } from "../util/cn";

export function InlineVideo({
  className,
  src,
}: {
  className?: string;
  src: { dark: string; light: string };
}) {
  const refs = useRef<HTMLVideoElement[]>([]);

  useEffect(() => {
    // Start videos when they enter the viewport and when they're visible.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLVideoElement;
          if (
            entry.isIntersecting &&
            element.checkVisibility({ opacityProperty: true })
          ) {
            element.play();
          } else {
            element.pause();
          }
        });
      },
      { threshold: 0.5 },
    );

    refs.current.forEach((ref) => {
      observer.observe(ref);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className={cn([className, "absolute inset-0"])}>
      <video
        autoPlay
        className="border-neutral bg-neutral pointer-events-none absolute inset-0 h-full w-full border object-cover object-left opacity-100 md:rounded-xl dark:opacity-0"
        loop
        muted
        playsInline
        ref={(el) => {
          if (el) {
            refs.current.push(el);
            return () => {
              refs.current.slice(refs.current.indexOf(el), 1);
            };
          }
        }}
        src={src.light}
        tabIndex={-1}
      />
      <video
        autoPlay
        className="border-neutral bg-neutral pointer-events-none absolute inset-0 h-full w-full border object-cover object-left opacity-0 md:rounded-xl dark:opacity-100"
        loop
        muted
        playsInline
        ref={(el) => {
          if (el) {
            refs.current.push(el);
            return () => {
              refs.current.slice(refs.current.indexOf(el), 1);
            };
          }
        }}
        src={src.dark}
        tabIndex={-1}
      />
    </div>
  );
}
