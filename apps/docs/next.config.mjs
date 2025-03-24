/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import nextra from "nextra";

const withNextra = nextra({
  codeHighlight: true,
  staticImage: true,
  theme: "./nextra-triplex",
});

export default withNextra({
  redirects: async () => [
    {
      destination: "/docs/get-started",
      permanent: false,
      source: "/docs",
    },
    {
      destination: "/docs/get-started",
      permanent: false,
      source: "/docs/overview",
    },
    {
      destination: "/resources/replacing-leva-with-props",
      permanent: false,
      source: "/docs/guides/leva-controls",
    },
    {
      destination: "/resources/edit-components-using-component-controls",
      permanent: false,
      source: "/docs/guides/component-controls",
    },
    {
      destination: "/resources/using-glsl-with-triplex",
      permanent: false,
      source: "/docs/guides/glsl-support",
    },
    {
      destination: "/docs/get-started/starting-a-project/pre-existing-project",
      permanent: false,
      source: "/docs/guides/javascript-projects",
    },
    {
      destination: "/docs/building-your-scene/global-provider",
      permanent: false,
      source: "/docs/guides/provider-controls",
    },
    {
      destination: "/docs/get-started/common-gotchas",
      permanent: false,
      source: "/docs/guides/common-gotchas",
    },
    {
      destination: "/docs/get-started/faq",
      permanent: false,
      source: "/docs/faq",
    },
  ],
  transpilePackages: ["@triplex/lib"],
  typescript: {
    ignoreBuildErrors: true,
  },
});
