/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import {
  BlocksIcon,
  FileSlidersIcon,
  RocketIcon,
  SlidersVerticalIcon,
} from "./icons";
import {
  LandingCardBody,
  LandingCardButton,
  LandingCardHeading,
  LandingCardIcon,
} from "./landing-card";
import { Tab, Tabs, TabsList, TabsRoot } from "./tabs";
import { InlineVideo } from "./video";

export function LandingFeatures() {
  return (
    <div className="flex flex-col gap-14">
      <h2 className="font-brand text-brand max-w-4xl text-5xl font-medium md:text-6xl lg:text-7xl">
        Powerful features to build it how you see it
      </h2>

      <TabsRoot>
        <div className="bg-surface relative -mx-8 flex h-[70vh] items-center justify-center md:aspect-video md:h-auto">
          <TabsList>
            <InlineVideo
              src={{
                dark: "/videos/vsce-controls-dark.mp4",
                light: "/videos/vsce-controls-light.mp4",
              }}
            />
            <InlineVideo
              src={{
                dark: "/videos/vsce-inputs-dark.mp4",
                light: "/videos/vsce-inputs-light.mp4",
              }}
            />
            <InlineVideo
              src={{
                dark: "/videos/vsce-save-dark.mp4",
                light: "/videos/vsce-save-light.mp4",
              }}
            />
            <InlineVideo
              src={{
                dark: "/videos/vsce-isolation-dark.mp4",
                light: "/videos/vsce-isolation-light.mp4",
              }}
            />
          </TabsList>
        </div>
        <div className="-mx-8 overflow-auto pl-8 [scrollbar-width:none] lg:-mx-20 lg:pl-20 [&::-webkit-scrollbar]:hidden">
          <div className="grid min-w-[80rem] gap-6 [grid-template-columns:1fr_1fr_1fr_1fr_auto]">
            <Tabs>
              <Tab>
                {({ isSelected, onClick }) => (
                  <LandingCardButton
                    onClick={onClick}
                    variant={isSelected ? "default" : "inverse"}
                  >
                    <LandingCardIcon icon={SlidersVerticalIcon} />
                    <LandingCardHeading decoration="01.">
                      Integrated Visual Controls
                    </LandingCardHeading>
                    <LandingCardBody>
                      From finding and selecting JSX elements through to
                      transforming 3D objects with transform controls, do it
                      visually when it's more productive.
                    </LandingCardBody>
                  </LandingCardButton>
                )}
              </Tab>
              <Tab>
                {({ isSelected, onClick }) => (
                  <LandingCardButton
                    onClick={onClick}
                    variant={isSelected ? "default" : "inverse"}
                  >
                    <LandingCardIcon icon={FileSlidersIcon} />
                    <LandingCardHeading decoration="02.">
                      Props Driven Input Controls
                    </LandingCardHeading>
                    <LandingCardBody>
                      Input controls are generated from props declared on your
                      components. When your component props change the input
                      controls are updated automatically.
                    </LandingCardBody>
                  </LandingCardButton>
                )}
              </Tab>
              <Tab>
                {({ isSelected, onClick }) => (
                  <LandingCardButton
                    onClick={onClick}
                    variant={isSelected ? "default" : "inverse"}
                  >
                    <LandingCardIcon icon={RocketIcon} />
                    <LandingCardHeading decoration="03.">
                      Production Ready, Always
                    </LandingCardHeading>
                    <LandingCardBody>
                      Forget about import and export, building in Triplex uses
                      your actual code. Making changes then saving saves back to
                      it — ready for the next deployment.
                    </LandingCardBody>
                  </LandingCardButton>
                )}
              </Tab>
              <Tab>
                {({ isSelected, onClick }) => (
                  <LandingCardButton
                    onClick={onClick}
                    variant={isSelected ? "default" : "inverse"}
                  >
                    <LandingCardIcon icon={BlocksIcon} />
                    <LandingCardHeading decoration="04.">
                      Build Components in Isolation
                    </LandingCardHeading>
                    <LandingCardBody>
                      From small components like a button or card through to
                      full production app sized ones, open any component and
                      work on it in isolation.
                    </LandingCardBody>
                  </LandingCardButton>
                )}
              </Tab>
            </Tabs>
            <div className="w-2 flex-shrink-0 lg:w-14" />
          </div>
        </div>
      </TabsRoot>
    </div>
  );
}
