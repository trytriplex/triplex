/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { AppIcon, BookOpenTextIcon, GameIcon, WebXRIcon } from "./icons";
import { InlineImage } from "./image";
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
    <div className="grid md:gap-6 md:overflow-hidden lg:-mr-20 lg:grid-cols-2 lg:gap-16 xl:gap-32">
      <TabsRoot>
        <div className="-mx-8 flex flex-col gap-6 md:mx-0 md:gap-10 lg:py-20">
          <div className="flex flex-col gap-6 px-8 lg:contents">
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
          </div>

          <TabsList>
            <LandingCard
              alignContentInline="center"
              size="xlarge"
              variant="inverse"
            >
              <LandingCardIcon icon={BookOpenTextIcon} />
              <LandingCardHeading>Learn React</LandingCardHeading>
              <LandingCardBody>
                Build your first{" "}
                <a
                  className="underline"
                  href="https://react.dev"
                  rel="noreferrer"
                  target="_blank"
                >
                  React
                </a>{" "}
                component with Triplex and learn as you go. Don't worry about
                bundlers, frameworks, or even your local environment. Just
                build. Triplex takes care of the rest.
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
              <LandingCardIcon icon={AppIcon} />
              <LandingCardHeading>Web Apps</LandingCardHeading>
              <LandingCardBody>
                From landing pages, blogs, and even the next biggest social
                media site, build it with Triplex. Need another dimension? Bring
                in{" "}
                <a
                  className="underline"
                  href="https://r3f.docs.pmnd.rs/"
                  rel="noreferrer"
                  target="_blank"
                >
                  React Three Fiber
                </a>{" "}
                and harmoniously build in 2D and 3D.
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
              <LandingCardIcon icon={GameIcon} />
              <LandingCardHeading>Web Games</LandingCardHeading>
              <LandingCardBody>
                Build web games, simulations, and more with{" "}
                <a
                  className="underline"
                  href="https://react.dev"
                  rel="noreferrer"
                  target="_blank"
                >
                  React
                </a>{" "}
                /{" "}
                <a
                  className="underline"
                  href="https://r3f.docs.pmnd.rs/"
                  rel="noreferrer"
                  target="_blank"
                >
                  Three Fiber
                </a>{" "}
                using the same knowledge and mental model. Create experiences
                that can run anywhere on any device.
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
              <LandingCardIcon icon={WebXRIcon} />
              <LandingCardHeading>WebXR</LandingCardHeading>
              <LandingCardBody>
                Using{" "}
                <a
                  className="underline"
                  href="https://r3f.docs.pmnd.rs/"
                  rel="noreferrer"
                  target="_blank"
                >
                  React Three Fiber
                </a>{" "}
                and its library of{" "}
                <a
                  className="underline"
                  href="https://github.com/pmndrs/xr"
                  rel="noreferrer"
                  target="_blank"
                >
                  WebXR components
                </a>{" "}
                build the next generation of apps with Triplex that can run on
                Meta Quest, Apple Vision Pro, and more.
              </LandingCardBody>
              <div className="flex gap-3">
                <LandingLink href="/download" variant="inverse">
                  Download
                </LandingLink>
                <LandingLink
                  href="/docs/building-your-scene/webxr"
                  variant="inverse-border"
                >
                  Learn More
                </LandingLink>
              </div>
            </LandingCard>
          </TabsList>
        </div>
        <div className="bg-surface relative -mx-8 flex h-[70vh] items-center justify-center md:mx-0 md:aspect-video md:h-full lg:justify-start lg:pl-96">
          <TabsList>
            <InlineImage
              src={{
                dark: "/ui/vsce-learn-dark.png",
                light: "/ui/vsce-learn-light.png",
              }}
            />
            <InlineImage
              src={{
                dark: "/ui/vsce-app-dark.png",
                light: "/ui/vsce-app-light.png",
              }}
            />
            <InlineImage
              src={{
                dark: "/ui/vsce-game-dark.png",
                light: "/ui/vsce-game-light.png",
              }}
            />
            <InlineImage
              src={{
                dark: "/ui/vsce-xr-dark.png",
                light: "/ui/vsce-xr-light.png",
              }}
            />
          </TabsList>
        </div>
      </TabsRoot>
    </div>
  );
}
