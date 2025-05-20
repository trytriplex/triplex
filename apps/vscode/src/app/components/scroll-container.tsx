/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { Root, Scrollbar, Thumb, Viewport } from "@radix-ui/react-scroll-area";
import { cn, useEvent } from "@triplex/lib";
import { bind } from "bind-event-listener";
import rafSchd from "raf-schd";
import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useMergeRefs } from "use-callback-ref";

export const ScrollContainer = forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode;
    className?: string;
    overflowIndicators?: boolean | "top" | "bottom";
  }
>(({ children, className, overflowIndicators = true }, fref) => {
  const [overflow, setOverflow] = useState({ bottom: false, top: false });
  const scrollContainer = useRef<HTMLDivElement>(null);
  const ref = useMergeRefs([fref, scrollContainer]);
  const topOverflowEnabled =
    overflowIndicators === true || overflowIndicators === "top";
  const bottomOverflowEnabled =
    overflowIndicators === true || overflowIndicators === "bottom";

  const updateOverflow = useEvent(() => {
    const el = scrollContainer.current;
    if (!el) {
      return;
    }

    setOverflow((prev) => {
      const showTopOverflow = topOverflowEnabled && el.scrollTop > 0;
      const showBottomOverflow =
        bottomOverflowEnabled &&
        Math.round(el.scrollTop) < el.scrollHeight - el.clientHeight;

      if (showTopOverflow !== prev.top || showBottomOverflow !== prev.bottom) {
        return { bottom: showBottomOverflow, top: showTopOverflow };
      }

      return prev;
    });
  });

  useEffect(() => {
    const el = scrollContainer.current;
    if (!el) {
      return;
    }

    const observer = new ResizeObserver(() => {
      updateOverflow();
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [updateOverflow]);

  useLayoutEffect(() => {
    const el = scrollContainer.current;
    if (!el) {
      return;
    }

    updateOverflow();

    return bind(el, {
      listener: rafSchd(updateOverflow),
      type: "scroll",
    });
  }, [updateOverflow]);

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
