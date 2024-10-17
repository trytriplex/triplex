/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { CaretDownIcon, CaretRightIcon } from "@radix-ui/react-icons";
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
  const [childrenOpen, setChildrenOpen] = useState(isChildSelected);
  const shouldNestChildren = !!children && level > 0;

  return (
    <Fragment>
      <Link
        className={cn([
          level > 1 && !isSelected && "border-l border-neutral-800",
          level > 1 && isSelected && "border-l border-blue-400",
          !!children && level > 0 && "pl-1",
          !!children && level === 0 && "mt-6 font-medium",
          isSelected
            ? "text-blue-400"
            : "text-neutral-300 hover:text-neutral-100",
          "flex items-center py-1 text-base",
          shouldNestChildren && "mb-1",
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
            <CaretDownIcon className="ml-auto" />
          ) : (
            <CaretRightIcon className="ml-auto" />
          ))}
      </Link>
      {shouldNestChildren && childrenOpen && (
        <div className="pl-3">{children}</div>
      )}
      {!shouldNestChildren && children}
    </Fragment>
  );
}
