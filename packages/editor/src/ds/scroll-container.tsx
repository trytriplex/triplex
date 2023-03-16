import * as ScrollArea from "@radix-ui/react-scroll-area";
import { cn } from "./cn";

export function ScrollContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ScrollArea.Root
      className={cn(["h-full flex-shrink overflow-hidden", className])}
    >
      <ScrollArea.Viewport className="h-full">{children}</ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        className="flex touch-none select-none rounded bg-neutral-800 p-0.5 transition-colors duration-150 ease-out data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col"
        orientation="vertical"
      >
        <ScrollArea.Thumb className="relative flex-1 rounded-xl bg-neutral-700 before:absolute before:top-1/2 before:left-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner className="bg-white" />
    </ScrollArea.Root>
  );
}
