import * as RadixMenubar from "@radix-ui/react-menubar";
import { ReactNode } from "react";

export function Trigger({
  children,
  ...props
}: RadixMenubar.MenubarTriggerProps) {
  return (
    <RadixMenubar.Trigger
      {...props}
      className="cursor-default rounded px-3 py-1 text-sm text-neutral-300 outline-none hover:bg-neutral-700 data-[state=open]:bg-neutral-700 data-[state=open]:text-blue-500"
    >
      {children}
    </RadixMenubar.Trigger>
  );
}

export function MenuContent({
  children,
  ...props
}: RadixMenubar.MenuContentProps) {
  return (
    <RadixMenubar.Portal>
      <RadixMenubar.Content
        {...props}
        className="mt-0.5 min-w-[150px] rounded bg-neutral-800 p-1 shadow-2xl shadow-black/50"
      >
        {children}
      </RadixMenubar.Content>
    </RadixMenubar.Portal>
  );
}

export function MenuItem({
  rslot,
  children,
  ...props
}: RadixMenubar.MenuItemProps & { rslot?: ReactNode }) {
  return (
    <RadixMenubar.Item
      {...props}
      className="flex select-none rounded px-2 py-1 text-sm text-neutral-300 outline-none hover:bg-neutral-700"
    >
      {children}
      {rslot && <div className="ml-auto text-neutral-500">{rslot}</div>}
    </RadixMenubar.Item>
  );
}

export function Menu({ children }: RadixMenubar.MenubarMenuProps) {
  return <RadixMenubar.Menu>{children}</RadixMenubar.Menu>;
}

export function Menubar({ children }: RadixMenubar.MenubarProps) {
  return <RadixMenubar.Root className="flex">{children}</RadixMenubar.Root>;
}

export function Separator() {
  return <RadixMenubar.Separator className="my-1 -mx-1 h-0.5 bg-neutral-700" />;
}
