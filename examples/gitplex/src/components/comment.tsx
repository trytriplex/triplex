import { cn } from "@triplex/lib";
import { type ReactNode } from "react";

export function Comment({
  avatarSize = "default",
  children,
  name,
  src,
  text,
}: {
  avatarSize?: "sm" | "default" | "lg";
  children?: ReactNode;
  name: string;
  src?: string;
  text: string;
}) {
  return (
    <div className="flex flex-col gap-2.5 py-2">
      <div className="flex items-center gap-2">
        <div
          className={cn([
            avatarSize === "sm" && "h-4 w-4",
            avatarSize === "default" && "h-6 w-6",
            avatarSize === "lg" && "h-8 w-8",
            "flex-shrink-0 overflow-hidden rounded-full border border-slate-700 bg-slate-800",
          ])}
        >
          {src && <img alt="" className="h-full w-full" src={src} />}
        </div>
        <div className="text-sm font-medium text-slate-200">{name}</div>
      </div>
      <div className="text-sm text-slate-300">{text}</div>
      {children}
    </div>
  );
}
