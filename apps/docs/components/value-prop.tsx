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
    <div className="mx-auto min-h-[150vh] max-w-4xl text-center lg:text-left odd:lg:text-right xl:-translate-x-28 odd:xl:translate-x-28">
      <section
        className="sticky top-0 flex min-h-[100lvh] flex-col justify-center gap-10 px-10"
        id={`value-prop-${index}`}
      >
        <div>
          <h2
            className={cn([
              "inline bg-gradient-to-r box-decoration-clone bg-clip-text text-4xl font-extrabold tracking-tight text-transparent mix-blend-difference md:text-5xl lg:text-6xl",
              fromIndexes[index % fromIndexes.length],
              toIndexes[index % toIndexes.length],
            ])}
          >
            {title}{" "}
          </h2>

          <p className="inline text-4xl font-medium tracking-tight text-neutral-200 md:text-5xl lg:text-6xl">
            {text}
          </p>
        </div>
      </section>
    </div>
  );
}
