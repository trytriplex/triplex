/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { Fragment } from "react";
import actionLinks from "../action-links.generated.json";

export function UIGlossary() {
  return Object.entries(actionLinks).map(([key, value]) => (
    <Fragment key={key}>
      <div className="mt-14">
        <h2
          className="text-default target:text-inverse inline scroll-m-20 text-3xl font-medium target:font-bold target:[-webkit-text-stroke:3px_yellow] target:[paint-order:stroke_fill] [&>code]:text-[length:inherit]"
          id={key}
        >
          {key}
        </h2>
      </div>
      <p className="text-subtle mt-5 text-xl md:text-lg">{value}</p>
    </Fragment>
  ));
}
