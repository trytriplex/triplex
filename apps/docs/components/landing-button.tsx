/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { cn } from "../util/cn";

export function LandingButton({ size = "base" }: { size?: "base" | "lg" }) {
  return (
    <div
      className={cn([
        size === "base" && "h-12 w-12",
        size === "lg" && "h-12 w-12 md:h-14 md:w-14",
        "bg-inverse text-inverse flex items-center justify-center rounded-full p-4",
      ])}
    >
      <svg
        className="ml-0.5"
        fill="none"
        height="100%"
        viewBox="0 0 16 27"
        width="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          clip-rule="evenodd"
          d="M14.9036 14.698L3.38031 26.2213L0.5 23.341L10.5831 13.2579L0.5 3.17475L3.38031 0.294434L14.9036 11.8177C15.2855 12.1997 15.5 12.7177 15.5 13.2579C15.5 13.798 15.2855 14.316 14.9036 14.698Z"
          fill="currentColor"
          fill-rule="evenodd"
        />
      </svg>
    </div>
  );
}
