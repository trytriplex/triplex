/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { cn } from "../util/cn";

const fromIndexes = [
  "from-teal-300",
  "from-cyan-300",
  "from-sky-300",
  "from-blue-300",
];

const toIndexes = [
  "to-indigo-300",
  "to-green-300",
  "to-teal-300",
  "to-green-300",
];

export function ValueProp({
  index = 0,
  text,
  title,
}: {
  index: number;
  text: string;
  title: string;
}) {
  return (
    <div className="mx-auto px-8 lg:px-20">
      <section
        className="top-0 flex h-0 min-h-[100lvh] flex-col items-center justify-stretch gap-10 text-center lg:flex-row lg:text-left"
        id={`value-prop-${index}`}
      >
        <div className="mx-auto text-center lg:basis-1/2">
          <h2
            className={cn([
              "inline bg-gradient-to-r box-decoration-clone bg-clip-text text-4xl font-extrabold text-transparent md:text-5xl lg:text-5xl",
              fromIndexes[index % fromIndexes.length],
              toIndexes[index % toIndexes.length],
            ])}
          >
            {title}{" "}
          </h2>

          <p className="inline text-4xl font-medium text-neutral-200 md:text-5xl lg:text-5xl">
            {text}
          </p>
        </div>
        {/* <div className="relative h-2/3 w-full basis-1/2 border border-[#9d4b4b] bg-neutral-950/90">
          <div
            className="absolute inset-0 opacity-80 [background:repeating-linear-gradient(transparent,transparent_var(--size),#292929_var(--size),#292929_calc(var(--size)+1px)),repeating-linear-gradient(to_right,transparent,transparent_var(--size),#292929_var(--size),#292929_calc(var(--size)+1px))]"
            style={{ "--size": "170px" }}
          />
        </div> */}
      </section>
    </div>
  );
}
