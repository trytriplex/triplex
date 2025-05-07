/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { createForkLogger } from "@triplex/lib/log";
import { getJsxElementPropTypes } from "../ast";
import { getJsxElementAtOrThrow, getJsxTag } from "../ast/jsx";
import { type TriplexProject } from "../ast/project";
import { type Prop, type Type } from "../types";

const log = createForkLogger("server:ai");
const decoder = new TextDecoder();

export type AIChatContext = ComponentContext | SelectionContext;

export type ComponentContext = {
  exportName: string;
  path: string;
  type: "component";
};

export type SelectionContext = {
  column: number;
  line: number;
  path: string;
  type: "selection";
};

function shapeToType(shape: Type[], type: "tuple" | "union"): string {
  return shape
    .map((type) => {
      if (type.kind === "union") {
        return shapeToType(type.shape, "union");
      }

      if (type.kind === "unhandled") {
        return undefined;
      }

      return type.kind;
    })
    .filter(Boolean)
    .join(type === "tuple" ? "," : "|");
}

function propToMarkdown(prop: Prop): string | undefined {
  switch (prop.kind) {
    case "boolean":
      return `- [${prop.name}, ${prop.kind}, true]`;

    case "string":
      return `- [${prop.name}, ${prop.kind}, "example"]`;

    case "number":
      return `- [${prop.name}, ${prop.kind}, 123]`;

    case "tuple":
      return `- [${prop.name}, ${shapeToType(prop.shape, "tuple")}, [1, 2, 3]]`;

    case "union":
      return `- [${prop.name}, ${shapeToType(prop.shape, "union")}, "string"]`;
  }

  return undefined;
}

export function createAI(project: TriplexProject) {
  const chatResponseParts: string[] = [];
  const listeners: (() => void)[] = [];
  let promptLock = false;

  function getChat() {
    return chatResponseParts;
  }

  function getChatLastPart() {
    return chatResponseParts.at(-1) || "";
  }

  async function prompt(options: { context: AIChatContext[]; prompt: string }) {
    if (promptLock) {
      return;
    }

    promptLock = true;

    chatResponseParts.push(`<user_message>${options.prompt}</user_message>`);
    listeners.forEach((callback) => callback());

    const context = options.context.map((ctx) => {
      if (ctx.type === "selection") {
        const sourceFile = project.getSourceFile(ctx.path).read();

        const element = getJsxElementAtOrThrow(
          sourceFile,
          ctx.line,
          ctx.column,
        );
        const tag = getJsxTag(element);
        const elementProps = getJsxElementPropTypes(element);

        return `
The user has focused a JSX element called "${tag.friendlyName}" so all edits prioritize it. Its details are as follows:

- File: "${ctx.path}"
- Line: ${ctx.line}
- Column: ${ctx.column}

The "${tag.friendlyName}" JSX element takes the following props, each list item is a tuple of [name, type, and example value]. Types should be inferred as TypeScript types. Use this information when modifying or adding props to the component.

${elementProps.props.map((prop) => propToMarkdown(prop)).join("\n")}
`;
      } else if (ctx.type === "component") {
        const sourceFile = project.getSourceFile(ctx.path).read();

        return `
The user has a React component called "${ctx.exportName}" open in Triplex located at "${sourceFile.getFilePath()}". Here is its source code:
\`\`\`
${sourceFile
  .getFullText()
  .split("\n")
  .map((line, index) => `${index + 1}|${line}`)
  .join("\n")}
\`\`\`

## Additional Context
- By default all code changes through the code_add and code_replace blocks MUST be inside the "${ctx.exportName}" React component, do NOT modify other components found in this file unless specifically asked to.
- Each line of code has been numbered for reference delimitated by a pipe "|". Do NOT include this in your response.
`;
      } else {
        throw new Error("invariant: unknown context type");
      }
    });

    log.debug(`Calling ${process.env.TRIPLEX_CLOUD_URL}/api/ai`);

    const response = await fetch(`${process.env.TRIPLEX_CLOUD_URL}/api/ai`, {
      body: JSON.stringify({
        context,
        prompt: options.prompt,
      }),
      method: "POST",
    });

    if (!response.body) {
      throw new Error("invariant: ai missing body");
    }

    for await (const part of response.body as unknown as AsyncIterable<Uint8Array>) {
      const text = decoder.decode(part);
      chatResponseParts.push(text);
      listeners.forEach((callback) => callback());
    }

    promptLock = false;
  }

  function onChatUpdated(callback: () => void): () => void {
    listeners.push(callback);

    return () => {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };
  }

  return {
    getChat,
    getChatLastPart,
    onChatUpdated,
    prompt,
  };
}
