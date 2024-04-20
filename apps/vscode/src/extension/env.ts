/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
if (process.env.NODE_ENV === "production") {
  // If we're building for production we also tell the client to run in production mode.
  // Since the client still runs in "development" we use a different environment variable.
  process.env.VITE_TRIPLEX_ENV = "production";
}
