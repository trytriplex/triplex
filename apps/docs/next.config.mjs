/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
      destination: "/guides/use-leva-with-triplex",
      permanent: false,
      source: "/docs/guides/leva-controls",
    },
    {
      destination: "/guides/edit-components-using-component-controls",
      permanent: false,
      source: "/docs/guides/component-controls",
    },
    {
      destination: "/guides/using-glsl-with-triplex",
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
  typescript: {
    ignoreBuildErrors: true,
  },
});
