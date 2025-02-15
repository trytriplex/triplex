/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

export function LandingUseTriplexAnywhere() {
  return (
    <div className="grid gap-10 overflow-hidden lg:-mr-20 lg:grid-cols-2 lg:gap-32">
      <div className="flex flex-col gap-10 lg:py-20">
        <h2 className="font-brand text-brand text-center text-5xl font-medium md:text-6xl lg:text-7xl">
          Use Triplex on any project
        </h2>

        <div className="flex justify-center gap-2">
          <div className="border-neutral outline-brand font-default text-default cursor-pointer rounded-full border px-4 py-1 text-lg font-medium outline outline-2 -outline-offset-1">
            Web Apps
          </div>
          <div className="border-neutral font-default text-default cursor-pointer rounded-full border px-4 py-1 text-lg font-medium">
            Games
          </div>
          <div className="border-neutral font-default text-default cursor-pointer rounded-full border px-4 py-1 text-lg font-medium">
            WebXR
          </div>
        </div>

        <div className="bg-inverse flex flex-col items-center gap-6 rounded-3xl p-10 md:p-14">
          <div className="text-inverse-subtle flex h-12">
            <svg viewBox="0 0 24 24">
              <g fill="none" fill-rule="evenodd" stroke="none" stroke-width="1">
                <g fill="currentColor" fillRule="nonzero">
                  <path d="M8.06561801,18.9432081 L14.565618,4.44320807 C14.7350545,4.06523433 15.1788182,3.8961815 15.5567919,4.06561801 C15.9032679,4.2209348 16.0741922,4.60676263 15.9697642,4.9611247 L15.934382,5.05679193 L9.43438199,19.5567919 C9.26494549,19.9347657 8.82118181,20.1038185 8.44320807,19.934382 C8.09673215,19.7790652 7.92580781,19.3932374 8.03023576,19.0388753 L8.06561801,18.9432081 L14.565618,4.44320807 L8.06561801,18.9432081 Z M2.21966991,11.4696699 L6.46966991,7.21966991 C6.76256313,6.9267767 7.23743687,6.9267767 7.53033009,7.21966991 C7.79659665,7.48593648 7.8208027,7.90260016 7.60294824,8.19621165 L7.53033009,8.28033009 L3.81066017,12 L7.53033009,15.7196699 C7.8232233,16.0125631 7.8232233,16.4874369 7.53033009,16.7803301 C7.26406352,17.0465966 6.84739984,17.0708027 6.55378835,16.8529482 L6.46966991,16.7803301 L2.21966991,12.5303301 C1.95340335,12.2640635 1.9291973,11.8473998 2.14705176,11.5537883 L2.21966991,11.4696699 L6.46966991,7.21966991 L2.21966991,11.4696699 Z M16.4696699,7.21966991 C16.7359365,6.95340335 17.1526002,6.9291973 17.4462117,7.14705176 L17.5303301,7.21966991 L21.7803301,11.4696699 C22.0465966,11.7359365 22.0708027,12.1526002 21.8529482,12.4462117 L21.7803301,12.5303301 L17.5303301,16.7803301 C17.2374369,17.0732233 16.7625631,17.0732233 16.4696699,16.7803301 C16.2034034,16.5140635 16.1791973,16.0973998 16.3970518,15.8037883 L16.4696699,15.7196699 L20.1893398,12 L16.4696699,8.28033009 C16.1767767,7.98743687 16.1767767,7.51256313 16.4696699,7.21966991 Z" />
                </g>
              </g>
            </svg>
          </div>

          <h3 className="font-default text-inverse text-center text-5xl font-medium">
            Web Apps
          </h3>

          <div className="text-inverse-subtle text-center text-lg">
            Lorem ipsum dolor sit amet consectetur. Mi magna quis proin et dis
            sollicitudin faucibus magna id. Lacus neque tristique quam faucibus.
            Praesent nunc in ullamcorper elementum fringilla et massa aenean.
          </div>

          <div className="mt-4 flex justify-center gap-6">
            <div className="bg-surface text-default font-default cursor-pointer px-6 py-2 text-lg font-medium">
              Download
            </div>
            <div className="border-surface text-inverse font-default cursor-pointer border-2 bg-transparent px-6 py-2 text-lg font-medium">
              See Docs
            </div>
          </div>
        </div>
      </div>
      <div className="bg-surface border-neutral aspect-video h-full border"></div>
    </div>
  );
}
