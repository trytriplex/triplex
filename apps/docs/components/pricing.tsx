/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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
        "flex w-full max-w-sm flex-col gap-3 rounded-xl border p-4",
        highlight ? "border-transparent" : "border-neutral",
        highlight &&
          "outline-brand relative outline outline-4 before:absolute lg:mt-0",
      ])}
    >
      <h2 className="text-default mt-6 text-center text-3xl font-medium">
        {name}
      </h2>

      <p className="text-default px-4 text-center text-lg lg:text-base">
        {description}
      </p>

      {price && (
        <p className="mt-6 flex items-center justify-center text-center font-medium">
          <span className="text-subtle text-2xl">$</span>
          <span className="text-default text-5xl">{price[0]}</span>
          {price[0] && (
            <span className="text-subtle self-end text-sm">USD</span>
          )}
        </p>
      )}

      <p className="text-subtle mb-8 text-center text-sm">{perMonthLabel}</p>
      <div className="w-full self-end">{cta}</div>

      {children}
    </li>
  );
}

export function Pricing() {
  return (
    <ul className="mt-16 flex w-full max-w-7xl flex-col items-center justify-center gap-6 lg:flex-row lg:items-stretch">
      <PricingPanel
        cta={
          <>
            <Link
              className="text-subtle border-neutral block rounded border py-2 text-center text-base font-medium"
              href="https://github.com/sponsors/itsdouges/sponsorships?sponsor=itsdouges&preview=true&frequency=recurring&amount=19"
            >
              Sponsor Development
            </Link>

            <div className="mt-3 text-center">
              <Link
                className="text-subtle text-base font-medium"
                href="/download"
              >
                Download Now
              </Link>
            </div>
          </>
        }
        description="The essentials for individuals and open source projects."
        name="Free"
        perMonthLabel="per month, forever"
        price={[0]}
      >
        <ul className="border-neutral -mx-4 -mb-4 mt-4 flex flex-col gap-3 border-t px-4 py-5">
          <li>
            <DetailsSummary
              details="Develop with Triplex on your OS of choice using Triplex Standalone, or with Triplex for VS Code."
              summary="Visual development environment"
            />
          </li>
          <li>
            <DetailsSummary
              details="Work on as many open-source projects as you want, with as many collaborators as you want."
              summary="Unlimited open-source projects"
            />
          </li>
          <li>
            <DetailsSummary
              details="When working by yourself, work in as many private projects as you want at no charge."
              summary="Unlimited private projects"
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
              details="Create support tickets through GitHub and Discord."
              summary="Web-based support"
            />
          </li>
        </ul>
      </PricingPanel>
      <PricingPanel
        cta={
          <Link
            className="text-inverse bg-brand block rounded py-2 text-center text-base font-medium"
            href="mailto:support@triplex.dev"
          >
            Free in Beta
          </Link>
        }
        description="Collaborate with your team across unlimited projects."
        highlight
        name="Teams"
        perMonthLabel="per month"
        price={[19]}
      >
        <ul className="border-neutral -mx-4 -mb-4 mt-4 flex flex-col gap-3 border-t p-4">
          <li className="text-subtle flex items-center gap-4 text-base">
            <ArrowLeftIcon /> Everything in Free, and...
          </li>
          <li>
            <DetailsSummary
              details="Create support tickets and get priority support to resolve it as soon as possible."
              summary="Priority support"
            />
          </li>
          <li>
            <DetailsSummary
              details="Influence the direction of Triplex by using and giving feedback on early features that are important to you."
              summary="Early access to new features"
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
      <summary className="text-default flex cursor-pointer list-none items-center gap-4 text-base font-medium">
        <ChevronRightIcon className="group-open:rotate-90" /> {summary}
      </summary>
      <p className="text-subtle mt-1 pl-8 text-base">{details}</p>
    </details>
  );
}
