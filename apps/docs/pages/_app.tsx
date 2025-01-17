/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { type AppProps } from "next/app";
import "../globals.css";
import "../themes/default.css";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
