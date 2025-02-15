/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { LandingLink } from "./landing-button";
import {
  LandingCard,
  LandingCardBody,
  LandingCardHeading,
  LandingCardIcon,
} from "./landing-card";
import { PillButton } from "./pill-button";

export function LandingUseTriplexAnywhere() {
  return (
    <div className="grid gap-10 overflow-hidden lg:-mr-20 lg:grid-cols-2 lg:gap-32">
      <div className="flex flex-col gap-10 lg:py-20">
        <h2 className="font-brand text-brand text-center text-5xl font-medium md:text-6xl lg:text-7xl">
          Use Triplex on any project
        </h2>

        <div className="flex justify-center gap-2">
          <PillButton isSelected>Web Apps</PillButton>
          <PillButton>Games</PillButton>
          <PillButton>WebXR</PillButton>
        </div>

        <LandingCard alignContentInline="center" size="xlarge">
          <LandingCardIcon />
          <LandingCardHeading>Web Apps</LandingCardHeading>
          <LandingCardBody>
            Lorem ipsum dolor sit amet consectetur. Mi magna quis proin et dis
            sollicitudin faucibus magna id. Lacus neque tristique quam faucibus.
            Praesent nunc in ullamcorper elementum fringilla et massa aenean.
          </LandingCardBody>
          <div className="flex gap-3">
            <LandingLink href="/download" variant="inverse">
              Download
            </LandingLink>
            <LandingLink
              href="/docs/building-your-scene"
              variant="inverse-subtle"
            >
              See Docs
            </LandingLink>
          </div>
        </LandingCard>
      </div>
      <div className="bg-surface border-neutral aspect-video h-full border"></div>
    </div>
  );
}
