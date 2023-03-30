import { IconProps } from "@radix-ui/react-icons/dist/types";
import { ComponentType } from "react";
import { cn } from "./cn";

export function IconButton({
  icon: Icon,
  title,
  isSelected,
  onClick,
}: {
  icon: ComponentType<IconProps>;
  title: string;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
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
  );
}
