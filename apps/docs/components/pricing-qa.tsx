/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { ChevronRightIcon } from "@radix-ui/react-icons";

export function PricingQuestionAnswer({
  answer,
  question,
}: {
  answer: string;
  question: string;
}) {
  return (
    <details className="group">
      <summary className="text-default flex cursor-pointer list-none items-center gap-4 text-2xl">
        <ChevronRightIcon className="text-subtle group-open:rotate-90" />{" "}
        {question}
      </summary>
      <p className="text-subtle mt-1 pl-8 text-lg">{answer}</p>
    </details>
  );
}
