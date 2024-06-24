/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Root, Scrollbar, Thumb, Viewport } from "@radix-ui/react-scroll-area";
import { cn } from "@triplex/lib";

export function ScrollContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Root className={cn(["min-w-0 flex-shrink overflow-hidden", className])}>
      <Viewport className="h-full [&>div]:!block">{children}</Viewport>
      <Scrollbar
        className="z-50 flex touch-none select-none data-[orientation=horizontal]:h-2 data-[orientation=vertical]:w-2 data-[orientation=horizontal]:flex-col"
        orientation="vertical"
      >
        <Thumb className="bg-scrollbar hover:bg-scrollbar-hovered active:bg-scrollbar-active relative flex-1 before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[12px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
      </Scrollbar>
    </Root>
  );
}
