/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import { type IconProps } from "@radix-ui/react-icons/dist/types";
import { useRouter } from "next/router";
import { useEffect, useId, useState, type FormEvent } from "react";
import { cn } from "../util/cn";

function FeedbackButton({
  icon: Icon,
  isSelected,
  label,
  onClick,
  value,
}: {
  icon: (props: IconProps) => React.ReactNode;
  isSelected?: boolean;
  label: string;
  onClick?: () => void;
  value: string;
}) {
  const id = useId();

  return (
    <div>
      <input
        checked={isSelected}
        className="peer sr-only"
        id={id}
        name="sentiment"
        onChange={onClick}
        type="radio"
        value={value}
      />
      <label
        aria-label={label}
        className={cn([
          isSelected && "border-blue-400 bg-blue-950 text-blue-300",
          !isSelected &&
            "border-neutral-700 bg-white/5 text-neutral-400 hover:border-neutral-500 hover:bg-white/10 hover:text-neutral-200 peer-focus-visible:border-neutral-500",
          "-my-1 flex h-8 w-8 cursor-default items-center justify-center rounded-full border outline-4 outline-neutral-800 peer-focus-visible:outline",
        ])}
        htmlFor={id}
        title={label}
      >
        <Icon />
      </label>
    </div>
  );
}

export function SendFeedback() {
  const route = useRouter();
  const [feedbackSelected, setFeedbackSelected] = useState<
    "yes" | "no" | "complete" | false
  >(false);

  useEffect(() => {
    return () => {
      setFeedbackSelected(false);
    };
  }, [route.pathname]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedbackSelected("complete");

    const formData = new FormData(event.currentTarget);

    await fetch("/api/feedback", {
      body: JSON.stringify(Object.fromEntries(formData)),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
  }

  return (
    <div className="mx-auto flex justify-center">
      <form
        className="flex flex-col gap-3 border border-neutral-800 px-6 py-4"
        key={route.pathname}
        onSubmit={onSubmit}
      >
        <input name="pathname" type="hidden" value={route.pathname} />
        <input name="app" type="hidden" value="docs" />
        {feedbackSelected === "complete" && (
          <div className="text-sm text-neutral-400">
            Thanks for your feedback!
          </div>
        )}
        {feedbackSelected !== "complete" && (
          <>
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm text-neutral-400">
                Was this page helpful?
              </span>
              <FeedbackButton
                icon={CheckCircledIcon}
                isSelected={feedbackSelected === "yes"}
                label="Yes"
                onClick={() => setFeedbackSelected("yes")}
                value="positive"
              />
              <FeedbackButton
                icon={CrossCircledIcon}
                isSelected={feedbackSelected === "no"}
                label="No"
                onClick={() => setFeedbackSelected("no")}
                value="negative"
              />
            </div>
            {feedbackSelected && (
              <div className="-mx-2 flex w-72 flex-col gap-3">
                <textarea
                  aria-label="Anything you'd like to tell us?"
                  className="h-20 w-full resize-none border border-neutral-700 bg-transparent p-2 text-sm text-neutral-200 placeholder:text-neutral-500 focus:border-blue-400 focus:outline-none"
                  name="feedback"
                  placeholder="Anything you'd like to tell us?"
                />
                <button
                  className="rounded bg-blue-400 px-4 py-1 text-neutral-950"
                  type="submit"
                >
                  Send feedback
                </button>
              </div>
            )}
          </>
        )}
      </form>
    </div>
  );
}
