import { IconProps } from "@radix-ui/react-icons/dist/types";
import { ComponentType, forwardRef } from "react";
import { cn } from "./cn";

export const IconButton = forwardRef<
  HTMLButtonElement,
  {
    icon: ComponentType<IconProps>;
    title: string;
    isSelected?: boolean;
    onClick?: () => void;
  }
>(({ icon: Icon, title, isSelected, onClick }, ref) => (
  <button
    ref={ref}
    title={title}
    onClick={onClick}
    type="submit"
    className={cn([
      "self-start rounded-md p-1.5",
      isSelected
        ? "bg-white/5 text-blue-400"
        : "text-neutral-400 hover:bg-white/5 active:bg-white/10",
    ])}
  >
    <Icon />
  </button>
));
