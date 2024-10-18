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
  typescript: {
    ignoreBuildErrors: true,
  },
});
