/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { ChevronDownIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Fragment, useState } from "react";
import { cn } from "../util/cn";

export function SideNavItem({
  children,
  href,
  isChildSelected = false,
  isSelected,
  level,
  title,
}: {
  children?: React.ReactNode;
  href: string;
  isChildSelected?: boolean;
  isSelected: boolean;
  level: number;
  title: string;
}) {
  const [childrenOpen, setChildrenOpen] = useState(
    isSelected || isChildSelected,
  );
  const shouldNestChildren = !!children && level > 0;

  return (
    <Fragment>
      <Link
        className={cn([
          level > 1 && !isSelected && "border-l border-neutral-800",
          level > 1 && isSelected && "border-l border-blue-400",
          !!children && level > 0 && "pl-1",
          level === 0 && "mt-6 font-medium",
          isSelected && "text-blue-400",
          !isSelected && level === 0 && "text-neutral-100",
          !isSelected &&
            level >= 1 &&
            "text-neutral-300 hover:text-neutral-100",
          "flex w-full items-center gap-2 py-1.5 text-base",
        ])}
        href={href}
        onClick={() =>
          setChildrenOpen((prev) => {
            if (isSelected) {
              return !prev;
            }

            return true;
          })
        }
        style={{ paddingLeft: `${(level - 1) * 16}px` }}
      >
        {title}
        {shouldNestChildren &&
          (childrenOpen ? (
            <ChevronDownIcon className="ml-auto" />
          ) : (
            <ChevronRightIcon className="ml-auto" />
          ))}
      </Link>
      {shouldNestChildren && childrenOpen && (
        <div className="pl-3">{children}</div>
      )}
      {!shouldNestChildren && children}
    </Fragment>
  );
}
