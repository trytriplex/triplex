import { IconProps } from "@radix-ui/react-icons/dist/types";
import { ComponentType, forwardRef } from "react";
import { cn } from "./cn";

export const IconButton = forwardRef<
  HTMLButtonElement,
  {
    icon: ComponentType<IconProps>;
    title: string;
    isSelected?: boolean;
    className?: string;
    onClick?: () => void;
    size?: "default" | "tight";
  }
>(
  (
    { icon: Icon, title, isSelected, onClick, className, size = "default" },
    ref
  ) => (
    <button
      ref={ref}
      title={title}
      onClick={onClick}
      type="submit"
      className={cn([
        isSelected
          ? "bg-white/5 text-blue-400"
          : "text-neutral-400 hover:bg-white/5 active:bg-white/10",
        size === "default" && "rounded-md p-1.5",
        size === "tight" && "rounded p-0.5",
        className,
      ])}
    >
      <Icon />
    </button>
  )
);
