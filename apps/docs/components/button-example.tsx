/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type IconProps } from "@radix-ui/react-icons/dist/types";
import Link from "next/link";
import { type JSX } from "react";
import { cn } from "../util/cn";

export function ActionLink({
  href,
  icon: Icon,
  name,
}: {
  href: string;
  icon?: ((props: IconProps) => JSX.Element) | string;
  name: string;
}) {
  return (
    <Link
      className={cn([
        "border-neutral group inline-flex gap-1.5 border py-0.5",
        Icon ? "pl-0.5 pr-1.5" : "px-1.5",
      ])}
      href={href}
    >
      {Icon && (
        <span className="bg-subtle flex p-1">
          {typeof Icon === "string" ? (
            <span className="text-subtle flex h-[15px] items-center text-sm">
              {Icon}
            </span>
          ) : (
            <Icon />
          )}
        </span>
      )}
      <span className="text-subtle flex items-center text-center text-sm group-hover:underline">
        {name}
      </span>
    </Link>
  );
}
