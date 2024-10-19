/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import {
  literal,
  maxLength,
  minLength,
  object,
  optional,
  parse,
  string,
  union,
} from "valibot";
import { BASE_URL } from "../../util/url";

const appNames = {
  docs: "Triplex Docs",
  standalone: "Triplex Standalone",
  vsce: "Triplex for VS Code",
};

const schema = object({
  app: union([literal("standalone"), literal("vsce"), literal("docs")]),
  feedback: optional(string([minLength(0), maxLength(1024)])),
  pathname: string([minLength(1), maxLength(96)]),
  sentiment: union([literal("positive"), literal("negative")]),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { app, feedback, pathname, sentiment } = parse(schema, req.body);

  if (typeof process.env.DISCORD_WEBHOOK_URL !== "string") {
    res
      .status(202)
      .json({ error: "Hook not set up, refer to repository README.md" });
    return;
  }

  try {
    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      body: JSON.stringify({
        embeds: [
          {
            fields: [
              { name: "Page", value: `${BASE_URL}${pathname}` },
              { name: "Feedback", value: feedback || "(empty)" },
              { name: "Sentiment", value: sentiment || "(empty)" },
            ],
            title: `Feedback for ${appNames[app]}`,
          },
        ],
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    res.status(201).json({ success: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    res.status(500).json({ error: "Failed to send feedback" });
  }
}
