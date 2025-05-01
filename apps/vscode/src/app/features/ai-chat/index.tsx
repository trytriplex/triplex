/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type AIChatContext } from "@triplex/server";
import { Suspense } from "react";
import { Button } from "../../components/button";
import { ScrollContainer } from "../../components/scroll-container";
import { useSceneContext, useSceneSelected } from "../app-root/context";
import { renderRenderable, useRenderableChatStream } from "./renderable";

function AIChatLog() {
  const renderables = useRenderableChatStream();

  return (
    <ScrollContainer>
      <div className="flex flex-col px-2.5 pt-2">
        {renderables.map(renderRenderable)}
      </div>
    </ScrollContainer>
  );
}

export function AIChat() {
  const { exportName, path } = useSceneContext();
  const selected = useSceneSelected();

  async function handleSubmit(data: FormData) {
    const prompt = data.get("prompt")?.toString() ?? "";
    const context: AIChatContext[] = [
      {
        exportName,
        path,
        type: "component",
      },
    ];

    if (selected) {
      context.push({
        column: selected.column,
        line: selected.line,
        path: selected.parentPath,
        type: "selection",
      });
    }

    if (prompt) {
      fetch(`http://localhost:${window.triplex.env.ports.server}/ai/prompt`, {
        body: JSON.stringify({ context, path, prompt }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
    }
  }

  return (
    <div className="border-overlay flex w-48 flex-shrink-0 flex-col gap-2 border-r">
      <Suspense>
        <AIChatLog />
      </Suspense>

      <form action={handleSubmit} className="mt-auto px-2.5 pb-2">
        <textarea
          autoFocus
          className="text-input focus:border-selected bg-input border-input placeholder:text-input-placeholder w-full resize-none rounded-sm border px-[9px] py-1.5 focus:outline-none"
          name="prompt"
          placeholder="Ask Triplex"
        />
        <Button actionId="(UNSAFE_SKIP)" type="submit" variant="cta">
          Ask
        </Button>
      </form>
    </div>
  );
}
