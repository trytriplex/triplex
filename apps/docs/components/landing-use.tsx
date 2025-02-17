/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { LandingButton, LandingLink } from "./landing-button";
import {
  LandingCard,
  LandingCardBody,
  LandingCardHeading,
  LandingCardIcon,
} from "./landing-card";
import { Tab, Tabs, TabsList, TabsRoot } from "./tabs";

export function LandingUseTriplexAnywhere() {
  return (
    <div className="grid gap-10 overflow-hidden md:gap-16 lg:-mr-20 lg:grid-cols-2 xl:gap-32">
      <TabsRoot>
        <div className="flex flex-col gap-10 lg:py-20">
          <h2 className="font-brand text-brand text-center text-5xl font-medium md:text-6xl lg:text-7xl">
            Use Triplex on any project
          </h2>

          <div className="flex flex-wrap justify-center gap-3">
            <Tabs>
              <Tab>
                {(props) => <LandingButton {...props}>Learn</LandingButton>}
              </Tab>
              <Tab>
                {(props) => <LandingButton {...props}>Apps</LandingButton>}
              </Tab>
              <Tab>
                {(props) => <LandingButton {...props}>Games</LandingButton>}
              </Tab>
              <Tab>
                {(props) => <LandingButton {...props}>WebXR</LandingButton>}
              </Tab>
            </Tabs>
          </div>

          <TabsList>
            <LandingCard
              alignContentInline="center"
              size="xlarge"
              variant="inverse"
            >
              <LandingCardIcon />
              <LandingCardHeading>Learning React</LandingCardHeading>
              <LandingCardBody>
                Open your first React component with Triplex and learn as you
                go. Don't worry about bundlers, frameworks, or even your local
                dev environment. Focus on building and Triplex will take care of
                the rest.
              </LandingCardBody>
              <div className="flex gap-3">
                <LandingLink href="/download" variant="inverse">
                  Download
                </LandingLink>
                <LandingLink
                  href="/docs/building-your-scene"
                  variant="inverse-border"
                >
                  Learn More
                </LandingLink>
              </div>
            </LandingCard>
            <LandingCard
              alignContentInline="center"
              size="xlarge"
              variant="inverse"
            >
              <LandingCardIcon />
              <LandingCardHeading>Web Apps</LandingCardHeading>
              <LandingCardBody>
                Landing pages, blogs, and even the next biggest social media
                site, build it with Triplex. Need another dimension? Bring in
                React Three Fiber and harmoniously build between both worlds.
              </LandingCardBody>
              <div className="flex gap-3">
                <LandingLink href="/download" variant="inverse">
                  Download
                </LandingLink>
                <LandingLink
                  href="/docs/building-your-scene"
                  variant="inverse-border"
                >
                  Learn More
                </LandingLink>
              </div>
            </LandingCard>
            <LandingCard
              alignContentInline="center"
              size="xlarge"
              variant="inverse"
            >
              <LandingCardIcon />
              <LandingCardHeading>Web Games</LandingCardHeading>
              <LandingCardBody>
                Build web games, simulations, and more with React / Three Fiber
                using the same skills and mental model. Create experiences that
                can run anywhere on any device.
              </LandingCardBody>
              <div className="flex gap-3">
                <LandingLink href="/download" variant="inverse">
                  Download
                </LandingLink>
                <LandingLink
                  href="/docs/building-your-scene"
                  variant="inverse-border"
                >
                  Learn More
                </LandingLink>
              </div>
            </LandingCard>
            <LandingCard
              alignContentInline="center"
              size="xlarge"
              variant="inverse"
            >
              <LandingCardIcon />
              <LandingCardHeading>WebXR</LandingCardHeading>
              <LandingCardBody>
                Using React Three Fiber and its library of WebXR components
                build the next generation of apps with Triplex that can run on
                Meta Quest, Apple Vision Pro, and more.
              </LandingCardBody>
              <div className="flex gap-3">
                <LandingLink href="/download" variant="inverse">
                  Download
                </LandingLink>
                <LandingLink
                  href="/docs/building-your-scene"
                  variant="inverse-border"
                >
                  Learn More
                </LandingLink>
              </div>
            </LandingCard>
          </TabsList>
        </div>
        <div className="bg-surface border-neutral flex aspect-video h-full items-center justify-center border lg:justify-start lg:pl-96">
          <TabsList>
            <div className="text-subtlest select-none font-mono text-3xl font-medium">
              (LEARN_REACT_VIDEO)
            </div>
            <div className="text-subtlest select-none font-mono text-3xl font-medium">
              (WEB_APPS_VIDEO)
            </div>
            <div className="text-subtlest select-none font-mono text-3xl font-medium">
              (WEB_GAMES_VIDEO)
            </div>
            <div className="text-subtlest select-none font-mono text-3xl font-medium">
              (WEB_XR_VIDEO)
            </div>
          </TabsList>
        </div>
      </TabsRoot>
    </div>
  );
}
