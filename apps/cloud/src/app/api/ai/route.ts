/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, type CoreMessage } from "ai";
import { array, object, parse, string } from "valibot";
import systemPrompt from "./system-prompt";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

const schema = object({
  context: array(string()),
  prompt: string(),
});

export async function POST(request: Request): Promise<Response> {
  const { context, prompt } = parse(schema, await request.json());

  const messages: CoreMessage[] = context.map((message) => ({
    content: message,
    role: "system",
  }));

  messages.push({ content: prompt, role: "user" });

  const result = streamText({
    messages,
    model: google("gemini-1.5-flash"),
    system: systemPrompt,
  });

  return result.toTextStreamResponse({
    headers: {
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
