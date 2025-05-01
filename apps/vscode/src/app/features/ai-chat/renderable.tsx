/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useState, type ReactNode } from "react";
import { experimental_useLazySubscriptionStream as useLazySubscriptionStream } from "../../hooks/ws";
import { AIMessage } from "./ai-message";
import { AIThinking } from "./ai-thinking";
import { CodeAdd } from "./code-add";
import { CodeReplace } from "./code-replace";
import { Mutations } from "./mutations";
import { XMLStreamParser, type Node } from "./parser";
import { UserMessage } from "./user-message";

export function renderRenderable(node: Node, index: number): ReactNode {
  switch (node.name) {
    case "ai_thinking":
      return <AIThinking key={index}>{node.text}</AIThinking>;

    case "ai_message":
      return <AIMessage key={index}>{node.text}</AIMessage>;

    case "code_add":
      return <CodeAdd key={index}>{node.text}</CodeAdd>;

    case "code_replace":
      return <CodeReplace key={index}>{node.text}</CodeReplace>;

    case "mutations":
      return (
        <Mutations key={index}>
          {node.text}
          {node.children.map(renderRenderable)}
        </Mutations>
      );

    case "user_message":
      return <UserMessage key={index}>{node.text}</UserMessage>;
  }
}

export function useRenderableChatStream() {
  const [parser] = useState(() => new XMLStreamParser());
  const [structure, setStructure] = useState<Node[]>([]);

  useLazySubscriptionStream("/ai/chat", (data, type) => {
    if (type === "chunk") {
      const actualData = typeof data === "string" ? data : data.join("");
      parser.processChunk(actualData);
      setStructure(parser.getStructure().children.concat([]));
    }
  });

  return structure;
}
