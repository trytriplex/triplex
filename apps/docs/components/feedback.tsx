/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import { type IconProps } from "@radix-ui/react-icons/dist/types";
import { useRouter } from "next/router";
import { useEffect, useId, useState } from "react";
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
          isSelected && "border-currentColor text-selected bg-selected",
          !isSelected &&
            "text-subtlest hover:text-default hover:bg-hovered active:bg-pressed peer-focus-visible:border-neutral border-neutral",
          "outline-neutral -my-1 flex h-8 w-8 cursor-default items-center justify-center rounded-full border outline-4 peer-focus-visible:outline",
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

  async function onSubmit(formData: FormData) {
    setFeedbackSelected("complete");

    const query = new URLSearchParams(
      formData as unknown as Record<string, string>,
    ).toString();

    await fetch("/api/feedback?" + query, {
      headers: { "Content-Type": "application/json" },
      method: "GET",
    });
  }

  return (
    <div className="mx-auto flex justify-center">
      <form
        action={onSubmit}
        className="border-neutral flex flex-col gap-3 border px-6 py-4"
        key={route.pathname}
      >
        <input name="pathname" type="hidden" value={route.pathname} />
        <input name="app" type="hidden" value="docs" />
        {feedbackSelected === "complete" && (
          <div className="text-subtlest text-sm">Thanks for your feedback!</div>
        )}
        {feedbackSelected !== "complete" && (
          <>
            <div className="flex items-center justify-center gap-3">
              <span className="text-subtle text-sm">
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
                  className="text-subtle placeholder:text-subtlest border-neutral h-20 w-full resize-none border bg-transparent p-2 text-sm focus:border-blue-400 focus:outline-none"
                  name="feedback"
                  placeholder="Anything you'd like to tell us?"
                />
                <button
                  className="text-inverse bg-brand rounded px-4 py-1 text-base font-medium"
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
