/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { Root, Scrollbar, Thumb, Viewport } from "@radix-ui/react-scroll-area";
import { cn } from "@triplex/lib";
import { bind } from "bind-event-listener";
import rafSchd from "raf-schd";
import { forwardRef, useLayoutEffect, useRef, useState } from "react";
import { useMergeRefs } from "use-callback-ref";

export const ScrollContainer = forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode;
    className?: string;
  }
>(({ children, className }, fref) => {
  const [overflow, setOverflow] = useState({ bottom: false, top: false });
  const scrollContainer = useRef<HTMLDivElement>(null);
  const ref = useMergeRefs([fref, scrollContainer]);

  useLayoutEffect(() => {
    const el = scrollContainer.current;
    if (!el) {
      return;
    }

    const testScroll = () => {
      setOverflow((prev) => {
        const showTopOverflow = el.scrollTop > 0;
        const showBottomOverflow =
          Math.round(el.scrollTop) < el.scrollHeight - el.clientHeight;

        if (
          showTopOverflow !== prev.top ||
          showBottomOverflow !== prev.bottom
        ) {
          return { bottom: showBottomOverflow, top: showTopOverflow };
        }

        return prev;
      });
    };

    testScroll();

    return bind(el, {
      listener: rafSchd(testScroll),
      type: "scroll",
    });
  }, []);

  return (
    <Root className={cn(["min-w-0 flex-shrink overflow-hidden", className])}>
      {overflow.top && (
        <div className="shadow-scrollbar absolute left-[1px] right-[1px] top-0 z-10 h-1" />
      )}
      <Viewport className="h-full [&>div]:!block" ref={ref}>
        {children}
      </Viewport>
      <Scrollbar
        className="z-50 flex touch-none select-none data-[orientation=horizontal]:h-2 data-[orientation=vertical]:w-2 data-[orientation=horizontal]:flex-col"
        orientation="vertical"
      >
        <Thumb className="bg-scrollbar hover:bg-scrollbar-hovered active:bg-scrollbar-active relative flex-1 before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[12px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
      </Scrollbar>
      {overflow.bottom && (
        <div className="shadow-scrollbar absolute bottom-0 left-[1px] right-[1px] z-10 h-1 -scale-100" />
      )}
    </Root>
  );
});

ScrollContainer.displayName = "ScrollContainer";
