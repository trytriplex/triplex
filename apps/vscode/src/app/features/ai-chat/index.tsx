/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { Cross2Icon, PaperPlaneIcon } from "@radix-ui/react-icons";
import { type AIChatContext } from "@triplex/server";
import { TriplexLogo } from "@triplex/ux";
import { Suspense, useRef, useState } from "react";
import { IconButton } from "../../components/button";
import { InlineErrorBoundary } from "../../components/inline-error-boundary";
import { Lozenge } from "../../components/lozenge";
import { ScrollContainer } from "../../components/scroll-container";
import { Surface } from "../../components/surface";
import { useSceneContext, useSceneSelected } from "../app-root/context";
import { renderRenderable, useRenderableChatStream } from "./renderable";

function AIChatLog() {
  const ref = useRef<HTMLDivElement>(null);
  const renderables = useRenderableChatStream(ref);

  return (
    <ScrollContainer ref={ref}>
      <div className="flex flex-col gap-6 py-3 pl-2 pr-2.5">
        {renderables.length === 0 && (
          <>
            <div className="h-4" />
            <TriplexLogo className="h-14" />
            <p className="text-subtlest px-3 text-center">
              Use Triplex AI to ask questions and update code. Mistakes are
              possible, review its output carefully.
            </p>
          </>
        )}

        {renderables.map(renderRenderable)}
      </div>
    </ScrollContainer>
  );
}

export function AIChat() {
  const { exportName, path } = useSceneContext();
  const selected = useSceneSelected();
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLFormElement>(null);

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

  if (!visible) {
    return (
      <Surface
        bg="overlay"
        className="absolute right-2 top-1.5 z-10 border p-0.5"
      >
        <IconButton
          actionId="(UNSAFE_SKIP)"
          icon={TriplexLogo}
          label="Ask Triplex AI"
          onClick={() => setVisible(true)}
        />
      </Surface>
    );
  }

  return (
    <div className="border-overlay relative flex w-56 flex-shrink-0 flex-col border-l">
      <div className="flex justify-end px-2 pb-1">
        <IconButton
          actionId="(UNSAFE_SKIP)"
          icon={Cross2Icon}
          label="Close Triplex AI"
          onClick={() => setVisible(false)}
        />
      </div>

      <InlineErrorBoundary>
        <Suspense>
          <AIChatLog />
        </Suspense>

        <form action={handleSubmit} className="mt-auto p-2" ref={ref}>
          <div className="focus-within:border-selected border-input text-input bg-input focus:border-selected flex flex-col rounded border focus-within:border">
            <div className="flex flex-wrap gap-1 p-1.5">
              <Lozenge title={`File "${path.split("/").at(-1)}" in context`}>
                {path.split("/").at(-1)}
              </Lozenge>
              <Lozenge title={`${exportName} export in context`}>
                {exportName} export
              </Lozenge>
              {selected && (
                <Lozenge title="Current selection in context">
                  Selection
                </Lozenge>
              )}
            </div>
            <div className="flex">
              <textarea
                autoFocus
                className="placeholder:text-input-placeholder bg-input w-full resize-none rounded-md px-2 py-0.5 focus:outline-none"
                name="prompt"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    ref.current?.requestSubmit();
                  }
                }}
                placeholder="Ask Triplex"
              />
              <div className="flex items-end p-1.5">
                <IconButton
                  actionId="(UNSAFE_SKIP)"
                  icon={PaperPlaneIcon}
                  label="Ask Triplex (Enter)"
                  onClick={() => {}}
                  type="submit"
                />
              </div>
            </div>
          </div>
        </form>
      </InlineErrorBoundary>
    </div>
  );
}
