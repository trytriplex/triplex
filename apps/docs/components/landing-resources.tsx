/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { getPagesUnderRoute } from "nextra/context";
import { LandingLink, LandingPresentationalButton } from "./landing-button";
import { LandingCardHeading, LandingCardLink } from "./landing-card";

export function LandingResource({ slug }: { slug: string }) {
  const page = getPagesUnderRoute("/resources").find(
    (page) => page.name === slug,
  );

  if (!page) {
    throw new Error(`invariant: page /resources/${slug} does not exist.`);
  }

  return (
    <LandingCardLink href={page.route} size="default">
      <div className="flex items-start justify-between gap-20 self-stretch lg:mb-8">
        <LandingCardHeading>{page.meta?.title || page.name}</LandingCardHeading>
        <div className="-my-1.5">
          <LandingPresentationalButton variant="inverse-hint" />
        </div>
      </div>
      <div className="flex flex-col-reverse items-start gap-3 lg:flex-row lg:gap-10">
        <div className="text-subtle w-3/12 flex-shrink-0 overflow-hidden text-ellipsis whitespace-nowrap text-base font-medium lg:w-2/12">
          {"frontMatter" in page ? page.frontMatter?.category : ""}
        </div>
        <div className="text-subtle text-base">
          {"frontMatter" in page ? page.frontMatter?.description : "(empty)"}
        </div>
      </div>
    </LandingCardLink>
  );
}

export function LandingResources() {
  return (
    <div className="flex flex-col gap-12 lg:flex-row lg:gap-24">
      <div className="flex flex-col items-start gap-10">
        <h2 className="font-brand text-brand max-w-4xl text-5xl font-medium md:text-6xl lg:text-7xl">
          Resources
        </h2>
        <LandingLink href="/resources" variant="border">
          See More
        </LandingLink>
      </div>
      <div className="flex flex-col gap-6">
        <LandingResource slug="edit-components-using-component-controls" />
        <LandingResource slug="fix-shadows-vertex-shader-threejs" />
        <LandingResource slug="use-leva-with-triplex" />
      </div>
    </div>
  );
}
