/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { LandingLink, LandingPresentationalButton } from "./landing-button";

export function LandingResource() {
  return (
    <div className="bg-surface border-neutral group relative flex flex-col gap-20 rounded-2xl border p-6 md:col-start-1 md:row-start-1 md:row-end-3 md:p-10">
      <div className="flex items-center justify-between">
        <h3 className="font-default text-default text-3xl font-medium">
          Topic Name
        </h3>
        <LandingPresentationalButton variant="inverse" />
      </div>
      <div className="flex items-end gap-10">
        <div className="text-subtlest w-2/5 text-sm">Category</div>
        <div className="text-subtle text-base">
          Lorem ipsum dolor sit amet consectetur. Interdum quis donec ultrices
          eleifend tempor eu facilisi pulvinar. Facilisi ut amet scelerisque vel
          nec. Accumsan mauris tellus dui vitae.
        </div>
      </div>
    </div>
  );
}

export function LandingResources() {
  return (
    <div className="flex flex-col gap-12 md:flex-row md:gap-24">
      <div className="flex flex-col items-start gap-10">
        <h2 className="font-brand text-brand max-w-4xl text-5xl font-medium md:text-6xl lg:text-7xl">
          Resources
        </h2>
        <LandingLink href="/resources" variant="subtle">
          See Docs
        </LandingLink>
      </div>
      <div className="flex flex-col gap-6">
        <LandingResource />
        <LandingResource />
        <LandingResource />
      </div>
    </div>
  );
}
