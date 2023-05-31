import * as RadixMenubar from "@radix-ui/react-menubar";
import { ReactNode } from "react";
import { cn } from "./cn";

export function Trigger({
  children,
  ...props
}: RadixMenubar.MenubarTriggerProps) {
  return (
    <RadixMenubar.Trigger
      {...props}
      className="cursor-default rounded px-2 py-0.5 text-sm text-neutral-300 outline-none hover:bg-white/5 data-[state=open]:bg-white/5 data-[state=open]:text-blue-400"
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
        className="mt-0.5 min-w-[150px] rounded border border-neutral-800 bg-neutral-900 p-1 shadow-2xl shadow-black/50"
      >
        {children}
      </RadixMenubar.Content>
    </RadixMenubar.Portal>
  );
}

export function MenuItem({
  rslot,
  children,
  disabled,
  onClick,
  ...props
}: RadixMenubar.MenuItemProps & { rslot?: ReactNode }) {
  return (
    <RadixMenubar.Item
      {...props}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn([
        disabled
          ? "cursor-not-allowed opacity-60"
          : "hover:bg-white/5 active:bg-white/10",
        "flex select-none rounded px-2 py-1 text-sm text-neutral-300 outline-none",
      ])}
    >
      {children}
      {rslot && <div className="ml-auto pl-7 text-neutral-400">{rslot}</div>}
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
  return (
    <RadixMenubar.Separator className="-mx-1 my-1 h-[1px] bg-neutral-800" />
  );
}
