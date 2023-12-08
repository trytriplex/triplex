/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { ArrowLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { type ReactNode } from "react";
import { cn } from "../util/cn";

function PricingPanel({
  children,
  cta,
  description,
  highlight,
  name,
  perMonthLabel,
  price,
}: {
  children?: React.ReactNode;
  cta: ReactNode;
  description: string;
  highlight?: boolean;
  name: string;
  perMonthLabel: string;
  price?: [number];
}) {
  return (
    <li
      className={cn([
        "flex w-full max-w-sm basis-1/3 flex-col gap-2 rounded-xl border border-neutral-800 p-4 lg:w-auto",
        highlight &&
          "relative bg-neutral-950 before:absolute before:-inset-2 before:-z-10 before:rounded-2xl before:bg-blue-400 lg:mt-0",
      ])}
    >
      <h2 className="mt-2 text-center text-3xl font-extrabold text-neutral-200">
        {name}
      </h2>

      <p className="px-4 text-center text-lg text-neutral-200 lg:text-base">
        {description}
      </p>

      {price && (
        <p className="mt-6 flex items-center justify-center text-center font-medium">
          <span className="text-2xl text-neutral-300">$</span>
          <span className="text-5xl text-white/90">{price[0]}</span>
        </p>
      )}

      <p className="mb-8 text-center text-sm text-neutral-300">
        {perMonthLabel}
      </p>
      <div className="w-full self-end">{cta}</div>

      {children}
    </li>
  );
}

export function Pricing() {
  return (
    <ul className="mt-16 flex w-full max-w-7xl flex-col items-center justify-center gap-6 px-10 lg:flex-row lg:items-stretch">
      <PricingPanel
        cta={
          <>
            <Link
              className="block rounded border border-neutral-800 py-2 text-center font-semibold text-neutral-300"
              href="https://github.com/sponsors/itsdouges/sponsorships?sponsor=itsdouges&preview=true&frequency=recurring&amount=5"
            >
              Sponsor Development
            </Link>

            <div className="mt-2 text-center">
              <Link className="text-sm text-neutral-300" href="/download">
                Download Now
              </Link>
            </div>
          </>
        }
        description="The bare essentials for individuals."
        name="Free"
        perMonthLabel="per month, forever"
        price={[0]}
      >
        <ul className="-mx-4 -mb-4 mt-4 flex flex-col gap-3 border-t border-neutral-800 p-4">
          <li>
            <DetailsSummary
              details="Develop with Triplex on your OS of choice."
              summary="Visual editor for macOS & Windows"
            />
          </li>
          <li>
            <DetailsSummary
              details="Create as many Triplex projects as you want through the editor."
              summary="Unlimited projects"
            />
          </li>
          <li>
            <DetailsSummary
              details="Stay secure by receiving the latest updates automatically."
              summary="Automatic editor updates"
            />
          </li>
          <li>
            <DetailsSummary
              details="Create support tickets through Github."
              summary="Web-based support"
            />
          </li>
        </ul>
      </PricingPanel>
      <PricingPanel
        cta={
          <Link
            className="block rounded bg-blue-400 py-2 text-center font-bold text-neutral-800"
            href="mailto:team@triplex.dev"
          >
            Contact Us
          </Link>
        }
        description="Paid plans available 2024. Contact us for expression of interest."
        highlight
        name="Team"
        perMonthLabel=""
      >
        <ul className="-mx-4 -mb-4 mt-4 flex flex-col gap-3 border-t border-neutral-800 p-4">
          <li className="flex items-center gap-4 text-neutral-300">
            <ArrowLeftIcon /> Everything in Free, and...
          </li>
          <li>
            <DetailsSummary
              details="Available features are still being developed. Have a burning feature you'd pay for? Contact us and let us know."
              summary="We're currently cooking the features"
            />
          </li>
        </ul>
      </PricingPanel>
    </ul>
  );
}

function DetailsSummary({
  details,
  summary,
}: {
  details: string;
  summary: string;
}) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center gap-4 font-semibold text-neutral-300">
        <ChevronRightIcon className="group-open:rotate-90" /> {summary}
      </summary>
      <p className="pl-8 text-neutral-300">{details}</p>
    </details>
  );
}
