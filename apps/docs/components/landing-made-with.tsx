/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { LandingPresentationalButton } from "./landing-button";
import {
  LandingCard,
  LandingCardBody,
  LandingCardHeading,
} from "./landing-card";

export function LandingMadeWithTriplex() {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-default">
        <svg viewBox="0 0 153 20">
          <text className="font-brand fill-current text-xl" x="-1" y="16">
            Made with Triplex
          </text>
        </svg>
      </h2>
      <div className="grid gap-6 md:min-h-[80vh]">
        <LandingCard
          alignContentBlock="end"
          className="md:col-start-1 md:row-start-1 md:row-end-3"
          size="large"
        >
          <LandingCardHeading>Project Name</LandingCardHeading>
          <LandingCardBody>
            Lorem ipsum dolor sit amet consectetur. Augue nibh felis velit nisl
            mattis sapien. Amet varius in morbi tristique. Ultricies vestibulum
            quisque auctor est.
          </LandingCardBody>
          <LandingPresentationalButton size="lg" variant="default" />
        </LandingCard>

        <LandingCard
          alignContentBlock="end"
          className="md:col-start-2 md:row-start-1"
          size="default"
        >
          <LandingCardHeading>Project Name</LandingCardHeading>
          <LandingCardBody>
            Lorem ipsum dolor sit amet consectetur. Augue nibh felis velit nisl
            mattis sapien. Amet varius in morbi tristique. Ultricies vestibulum
            quisque auctor est.
          </LandingCardBody>
          <LandingPresentationalButton variant="default" />
        </LandingCard>

        <LandingCard
          alignContentBlock="end"
          className="md:col-start-2 md:row-start-2"
          size="default"
        >
          <LandingCardHeading>Project Name</LandingCardHeading>
          <LandingCardBody>
            Lorem ipsum dolor sit amet consectetur. Augue nibh felis velit nisl
            mattis sapien. Amet varius in morbi tristique. Ultricies vestibulum
            quisque auctor est.
          </LandingCardBody>
          <LandingPresentationalButton variant="default" />
        </LandingCard>
      </div>
    </div>
  );
}
