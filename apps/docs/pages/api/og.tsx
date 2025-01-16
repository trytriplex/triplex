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

async function fetchAssets() {
  const imageSrc = fetch(
    new URL("../../public/hero.png", import.meta.url),
  ).then((res) => res.arrayBuffer() as unknown as string);
  const logoSvg = fetch(
    new URL("../../public/logos/logo-icon.svg", import.meta.url),
  )
    .then((res) => res.text() as Promise<string>)
    .then((img) => `data:image/svg+xml;charset=utf-8,` + encodeURI(img));
  const bold = fetch(new URL("./Karla-Bold.ttf", import.meta.url)).then((res) =>
    res.arrayBuffer(),
  );

  return Promise.all([imageSrc, logoSvg, bold]);
}

function parseTitle(paramTitle: string | null) {
  const title = paramTitle || "Triplex IDE";
  const slicedTitle = title.slice(0, 30);

  if (title !== slicedTitle) {
    return slicedTitle + "...";
  }

  return slicedTitle;
}

export default async function (request: Request) {
  const [imageSrc, logoSvg, bold] = await fetchAssets();
  const { searchParams } = new URL(request.url);
  const title = parseTitle(searchParams.get("title"));

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "linear-gradient(to right, #292929 2px, transparent 1px), linear-gradient(to bottom, #292929 2px, transparent 1px)",
          backgroundSize: "228px 228px",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          gap: "0.5rem",
          height: "100%",
          padding: "4rem",
          width: "100%",
        }}
      >
        <img src={logoSvg} style={{ height: "10rem", opacity: 0.9 }} />
        <span
          style={{
            color: "white",
            fontFamily: "Karla-Bold",
            fontSize: "6rem",
            opacity: 0.9,
            paddingLeft: "10%",
            paddingRight: "10%",
            textAlign: "center",
          }}
        >
          {title}
        </span>
        <div
          style={{
            display: "flex",
            height: "28%",
            marginTop: "auto",
          }}
        >
          <img
            src={imageSrc}
            style={{
              objectFit: "cover",
            }}
          />
        </div>

        <div
          style={{
            border: "2px solid #404040",
            bottom: 0,
            left: 0,
            position: "absolute",
            right: 0,
            top: 0,
          }}
        />
      </div>
    ),
    {
      fonts: [
        {
          data: bold,
          name: "Karla-Bold",
          style: "normal",
        },
      ],
      height: 720,
      width: 1280,
    },
  );
}
