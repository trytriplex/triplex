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

export default async function(request: Request) {
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
      <div style={{ display: "flex", height: "100%", width: "100%" }}>
        <img
          src={imageData}
          style={{
            inset: 0,
            position: "absolute",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            height: "100%",
            justifyContent: "center",
            maxWidth: 1150,
            paddingLeft: 80,
            paddingRight: 80,
            width: "100%",
          }}
        >
          {date && (
            <span
              style={{
                color: "white",
                fontFamily: "Karla-Medium",
                fontSize: 28,
                letterSpacing: "-.025em",
                opacity: 0.7,
              }}
            >
              {date}
            </span>
          )}
          <span
            style={{
              color: "white",
              fontFamily: "Karla-ExtraBold",
              fontSize: 110,
              letterSpacing: "-.05em",
              lineHeight: 1,
              opacity: 0.9,
            }}
          >
            {title}
          </span>
          <span
            style={{
              color: "white",
              fontFamily: "Karla-Medium",
              fontSize: 36,
              letterSpacing: "-.025em",
              opacity: 0.8,
            }}
          >
            {subtitle}
          </span>
        </div>
      </div>
    ),
    {
      fonts: [
        {
          data: extraBold,
          name: "Karla-ExtraBold",
          style: "normal",
        },
        {
          data: medium,
          name: "Karla-Medium",
          style: "normal",
        },
      ],
      height: 720,
      width: 1280,
    }
  );
}
