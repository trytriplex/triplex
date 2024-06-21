/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { type AppProps } from "next/app";
import { Karla } from "next/font/google";
import "../globals.css";

const karla = Karla({
  display: "swap",
  fallback: ["serif"],
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style global jsx>{`
        html {
          font-family: ${karla.style.fontFamily};
        }
      `}</style>
      <script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-5M74J509GN"
      ></script>
      <script>
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-5M74J509GN');`}
      </script>
      <Component {...pageProps} />
    </>
  );
}
