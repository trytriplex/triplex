/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import Head from "next/head";
import type { NextraThemeLayoutProps } from "nextra";
import { MDXProvider } from "nextra/mdx";
import { BASE_URL } from "../util/url";
import { Layout } from "./layout";
import { components } from "./mdx";

export default function Root({
  children,
  pageOpts,
  pageProps,
  themeConfig,
}: NextraThemeLayoutProps) {
  const { frontMatter, title } = pageOpts;
  const imgTitle = encodeURIComponent(
    frontMatter.ogTitle || frontMatter.title || title,
  );
  const ogImageUrl = `${BASE_URL}/api/og?title=${imgTitle}`;

  return (
    <div className="relative grid grid-cols-12">
      <Head>
        <link href="/favicon.svg" rel="icon" />
        <title>{`${title} • Triplex`}</title>
        <meta content={title} property="og:title" />
        {frontMatter.description && (
          <>
            <meta content={frontMatter.description} property="og:description" />
            <meta
              content={frontMatter.description}
              name="twitter:description"
            />
          </>
        )}
        <meta content={ogImageUrl} property="og:image" />
        <meta content="summary_large_image" name="twitter:card" />
        <meta content={ogImageUrl} name="twitter:image" />
        <meta content="@_douges" name="twitter:site" />
        <meta content={title} name="twitter:title" />
      </Head>

      <Layout
        pageOpts={pageOpts}
        pageProps={pageProps}
        themeConfig={themeConfig}
      >
        <MDXProvider components={components}>{children}</MDXProvider>
      </Layout>
    </div>
  );
}
