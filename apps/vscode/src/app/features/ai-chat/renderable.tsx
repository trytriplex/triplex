/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { bind } from "bind-event-listener";
import {
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { experimental_useLazySubscriptionStream as useLazySubscriptionStream } from "../../hooks/ws";
import { AIMessage } from "./ai-message";
import { AIResponse } from "./ai-response";
import { AIThinking } from "./ai-thinking";
import { CodeAdd } from "./code-add";
import { CodeReplace } from "./code-replace";
import { Mutations } from "./mutations";
import { StreamingXMLParser, type Node } from "./parser";
import { UserMessage } from "./user-message";

export function renderRenderable(node: Node, index: number): ReactNode {
  switch (node.name) {
    case "ai_response":
      return (
        <AIResponse isResolved={node.isResolved} key={index}>
          {node.children.map(renderRenderable)}
        </AIResponse>
      );

    case "ai_thinking":
      return (
        <AIThinking isResolved={node.isResolved} key={index}>
          {node.text}
        </AIThinking>
      );

    case "ai_message":
      return (
        <AIMessage isResolved={node.isResolved} key={index}>
          {node.text}
        </AIMessage>
      );

    case "code_add":
      return (
        <CodeAdd isResolved={node.isResolved} key={index}>
          {node.text}
        </CodeAdd>
      );

    case "code_replace":
      return (
        <CodeReplace isResolved={node.isResolved} key={index}>
          {node.text}
        </CodeReplace>
      );

    case "mutations":
      return (
        <Mutations isResolved={node.isResolved} key={index}>
          {node.text}
          {node.children.map(renderRenderable)}
        </Mutations>
      );

    case "user_message":
      return (
        <UserMessage isResolved={node.isResolved} key={index}>
          {node.text}
        </UserMessage>
      );
  }
}

export function useRenderableChatStream(ref: RefObject<HTMLElement | null>) {
  const [parser] = useState(() => new StreamingXMLParser());
  const [structure, setStructure] = useState<Node[]>([]);
  const [shouldScroll, setShouldScroll] = useState(true);

  useLazySubscriptionStream("/ai/chat", (data, type) => {
    if (type === "chunk") {
      const chunk = typeof data === "string" ? data : data.join("");
      parser.processChunk(chunk);
      setStructure(parser.toStructure());
    }

    if (type === "all") {
      const string = typeof data === "string" ? data : data.join("");
      const structure = parser.parseString(string);
      setStructure(structure);
    }
  });

  useLayoutEffect(() => {
    if (ref.current && shouldScroll) {
      ref.current.scrollTo(0, 99_999);
    }
  }, [ref, shouldScroll, structure]);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    return bind(el, {
      listener() {
        const isAtBottom =
          el.scrollHeight - el.clientHeight === Math.round(el.scrollTop);

        setShouldScroll(isAtBottom);
      },
      type: "scroll",
    });
  }, [ref, structure]);

  return structure;
}
