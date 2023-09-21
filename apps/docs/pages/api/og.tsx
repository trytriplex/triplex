/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

async function getAssets() {
  const imageData = fetch(new URL("./bg.png", import.meta.url)).then(
    (res) => res.arrayBuffer() as unknown as string
  );
  const extraBold = fetch(
    new URL("./Karla-ExtraBold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());
  const medium = fetch(new URL("./Karla-Medium.ttf", import.meta.url)).then(
    (res) => res.arrayBuffer()
  );

  return Promise.all([imageData, extraBold, medium]);
}

export default async function (request: Request) {
  const [imageData, extraBold, medium] = await getAssets();

  const { searchParams } = new URL(request.url);
  const title = searchParams.has("title")
    ? searchParams.get("title")?.slice(0, 200)
    : "";
  const subtitle = searchParams.has("subtitle")
    ? searchParams.get("subtitle")?.slice(0, 200)
    : "";
  const date = searchParams.get("date") || "";

  return new ImageResponse(
    (
      <div style={{ height: "100%", width: "100%", display: "flex" }}>
        <img
          style={{
            position: "absolute",
            inset: 0,
          }}
          src={imageData}
        />
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            gap: 20,
            paddingLeft: 80,
            paddingRight: 80,
            maxWidth: 1150,
          }}
        >
          {date && (
            <span
              style={{
                fontFamily: "Karla-Medium",
                color: "white",
                opacity: 0.7,
                fontSize: 28,
                letterSpacing: "-.025em",
              }}
            >
              {date}
            </span>
          )}
          <span
            style={{
              fontFamily: "Karla-ExtraBold",
              color: "white",
              fontSize: 110,
              lineHeight: 1,
              opacity: 0.9,
              letterSpacing: "-.05em",
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontFamily: "Karla-Medium",
              color: "white",
              opacity: 0.8,
              fontSize: 36,
              letterSpacing: "-.025em",
            }}
          >
            {subtitle}
          </span>
        </div>
      </div>
    ),
    {
      width: 1280,
      height: 720,
      fonts: [
        {
          name: "Karla-ExtraBold",
          data: extraBold,
          style: "normal",
        },
        {
          name: "Karla-Medium",
          data: medium,
          style: "normal",
        },
      ],
    }
  );
}
