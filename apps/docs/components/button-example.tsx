/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { type IconProps } from "@radix-ui/react-icons/dist/types";
import Link from "next/link";

export function ButtonExample({
  href,
  icon: Icon,
  name,
}: {
  href: string;
  icon: (props: IconProps) => JSX.Element;
  name: string;
}) {
  return (
    <Link
      className="group inline-flex items-center border border-neutral-700 py-0.5 pl-0.5 pr-2"
      href={href}
    >
      <span className="mr-1 inline-flex bg-white/10 p-1">
        <Icon className="text-neutral-300" />
      </span>
      <span className="text-center text-sm text-neutral-300 group-hover:text-neutral-100 group-hover:underline">
        {name}
      </span>
    </Link>
  );
}
