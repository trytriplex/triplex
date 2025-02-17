/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { LandingPresentationalButton } from "./landing-button";
import {
  LandingCardBody,
  LandingCardHeading,
  LandingCardLink,
} from "./landing-card";

export function LandingMadeWithTriplex() {
  return (
    <div className="flex flex-col gap-6 md:gap-3">
      <h2 aria-label="Made with Triplex" className="text-default">
        <svg viewBox="0 0 155 20">
          <text
            className="font-brand fill-current text-xl font-medium"
            x="-1"
            y="16"
          >
            Made with Triplex
          </text>
        </svg>
      </h2>
      <div className="grid gap-6 md:min-h-[80vh] md:grid-cols-2">
        <LandingCardLink
          alignContentBlock="end"
          className="md:col-start-1 md:row-start-1 md:row-end-3"
          href="/"
          size="large"
          variant="inverse"
        >
          <LandingCardHeading>The Children Are Doomed</LandingCardHeading>
          <LandingCardBody>
            An innovative platformer that challenges the player to navigate
            through a series of increasingly difficult levels, with optional
            co-op play.
          </LandingCardBody>
          <LandingPresentationalButton size="lg" variant="inverse" />
        </LandingCardLink>
        <LandingCardLink
          alignContentBlock="end"
          className="md:col-start-2 md:row-start-1"
          href="https://www.hypermod.io"
          size="default"
          variant="inverse"
        >
          <LandingCardHeading>Hypermod</LandingCardHeading>
          <LandingCardBody>
            Impactful & effortless code migrations. Orchestrate large-scale code
            migrations across multiple repositories and technologies.
          </LandingCardBody>
          <LandingPresentationalButton variant="inverse" />
        </LandingCardLink>
        <LandingCardLink
          alignContentBlock="end"
          className="md:col-start-2 md:row-start-2"
          href="/"
          size="default"
          variant="inverse"
        >
          <LandingCardHeading>Untitled AR Fishing Game</LandingCardHeading>
          <LandingCardBody>
            Pull up the pond and get fishing in this augmented reality game that
            brings the outdoors to you. Catch fish, earn rewards, and more.
          </LandingCardBody>
          <LandingPresentationalButton variant="inverse" />
        </LandingCardLink>
      </div>
    </div>
  );
}
