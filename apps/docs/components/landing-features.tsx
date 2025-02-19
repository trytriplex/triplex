/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import {
  LandingCardBody,
  LandingCardButton,
  LandingCardHeading,
  LandingCardIcon,
} from "./landing-card";
import { Tab, Tabs, TabsList, TabsRoot } from "./tabs";

export function LandingFeatures() {
  return (
    <div className="flex flex-col gap-14">
      <h2 className="font-brand text-brand max-w-4xl text-5xl font-medium md:text-6xl lg:text-7xl">
        Powerful features to build it how you see it
      </h2>

      <TabsRoot>
        <div className="bg-surface border-neutral flex aspect-video items-center justify-center border">
          <TabsList>
            <div className="text-subtlest select-none font-mono text-3xl font-medium">
              (FEATURE_ONE_VIDEO)
            </div>
            <div className="text-subtlest select-none font-mono text-3xl font-medium">
              (FEATURE_TWO_VIDEO)
            </div>
            <div className="text-subtlest select-none font-mono text-3xl font-medium">
              (FEATURE_THREE_VIDEO)
            </div>
            <div className="text-subtlest select-none font-mono text-3xl font-medium">
              (FEATURE_FOUR_VIDEO)
            </div>
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
                    <LandingCardIcon />
                    <LandingCardHeading decoration="01.">
                      Build With Visual Controls
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
                    <LandingCardIcon />
                    <LandingCardHeading decoration="02.">
                      Controls Defined By Components
                    </LandingCardHeading>
                    <LandingCardBody>
                      Editor controls are defined by the props declared on your
                      components. When your component props change the controls
                      automatically get updated.
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
                    <LandingCardIcon />
                    <LandingCardHeading decoration="03.">
                      Your Code Stays With You
                    </LandingCardHeading>
                    <LandingCardBody>
                      Forget about import and export. When building visually
                      then saving your code gets updated. When building in your
                      code editor then saving Triplex gets updated.
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
                    <LandingCardIcon />
                    <LandingCardHeading decoration="04.">
                      Build Components In Isolation
                    </LandingCardHeading>
                    <LandingCardBody>
                      From small components like a button or card through to
                      large ones like a full page or app, open any component and
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
