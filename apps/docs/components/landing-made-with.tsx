/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { getPagesUnderRoute } from "nextra/context";
import { LandingPresentationalButton } from "./landing-button";
import {
  LandingCardBody,
  LandingCardHeading,
  LandingCardLink,
} from "./landing-card";
import { InlineVideo } from "./video";

export function LandingMadeWithTriplex() {
  const heroTemplate = getPagesUnderRoute(
    "/docs/get-started/starting-a-project/create-from-template",
  )
    .filter((page) => page.kind === "MdxPage")
    .find((page) => page.name === "point-and-click");

  if (!heroTemplate) {
    throw new Error("invariant: template not found");
  }

  return (
    <div className="flex flex-col gap-6 md:gap-3">
      <h2 aria-label="Build with Triplex" className="text-default">
        <svg viewBox="0 0 153 20">
          <text
            className="font-brand fill-current text-xl font-medium"
            x="-1"
            y="16"
          >
            Build with Triplex
          </text>
        </svg>
      </h2>
      <div className="grid gap-6 md:min-h-[80vh] md:grid-cols-2">
        <LandingCardLink
          alignContentBlock="end"
          className="relative overflow-hidden md:col-start-1 md:row-start-1 md:row-end-3"
          href={heroTemplate.route}
          size="large"
          variant="inverse"
        >
          <InlineVideo
            className="opacity-70 group-hover:opacity-80"
            src={{
              dark: "/videos/template-point-and-click-dark.mp4",
              light: "/videos/template-point-and-click-light.mp4",
            }}
          />
          <LandingCardHeading>
            {heroTemplate.frontMatter?.title}
          </LandingCardHeading>
          <LandingCardBody>
            {heroTemplate.frontMatter?.description}
          </LandingCardBody>
          <LandingPresentationalButton size="lg" variant="inverse" />
        </LandingCardLink>
        <LandingCardLink
          alignContentBlock="end"
          className="md:col-start-2 md:row-start-1"
          href="/docs/community"
          size="default"
          variant="inverse"
        >
          <LandingCardHeading>Join The Community</LandingCardHeading>
          <LandingCardBody>
            We have a community of hundreds building with Triplex. Join us on
            Discord and see other Community portals for ways to get involved.
          </LandingCardBody>
          <LandingPresentationalButton variant="inverse" />
        </LandingCardLink>
        <LandingCardLink
          alignContentBlock="end"
          className="md:col-start-2 md:row-start-2"
          href="/docs/get-started/starting-a-project/create-from-template"
          size="default"
          variant="inverse"
        >
          <LandingCardHeading>More Templates</LandingCardHeading>
          <LandingCardBody>
            Creating a new project from a template is the fastest way to start
            building your next app with Triplex.
          </LandingCardBody>
          <LandingPresentationalButton variant="inverse" />
        </LandingCardLink>
      </div>
    </div>
  );
}
