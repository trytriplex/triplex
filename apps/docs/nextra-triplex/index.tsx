/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import Head from "next/head";
import Script from "next/script";
// @ts-ignore
import type { NextraThemeLayoutProps } from "nextra";
import { MDXProvider } from "nextra/mdx";
import { karla, suse } from "../themes/fonts";
import { cn } from "../util/cn";
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
    <div
      className={cn([
        karla.variable,
        suse.variable,
        "font-default relative grid grid-cols-12",
      ])}
    >
      <Head>
        <link href="/logos/logo-icon.svg" rel="icon" />
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
        <meta content="@trytriplex" name="twitter:site" />
        <meta content={title} name="twitter:title" />
      </Head>

      <Layout
        pageOpts={pageOpts}
        pageProps={pageProps}
        themeConfig={themeConfig}
      >
        <MDXProvider components={components}>{children}</MDXProvider>
      </Layout>

      <Script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-5M74J509GN');`,
        }}
      />
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-5M74J509GN"
      />
    </div>
  );
}
