/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  Corner,
  Root,
  Scrollbar,
  Thumb,
  Viewport,
} from "@radix-ui/react-scroll-area";
import { cn } from "./cn";

export function ScrollContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Root className={cn(["h-full flex-shrink overflow-hidden", className])}>
      <Viewport className="h-full">{children}</Viewport>
      <Scrollbar
        className="flex touch-none select-none data-[orientation=horizontal]:h-2 data-[orientation=vertical]:w-2 data-[orientation=horizontal]:flex-col"
        orientation="vertical"
      >
        <Thumb className="relative flex-1 rounded bg-white/10 before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[12px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
      </Scrollbar>
      <Corner className="bg-white" />
    </Root>
  );
}
