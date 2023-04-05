import "@/styles/global.css";

import React, { useEffect, useState } from "react";

import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import clsx from "clsx";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import type { AppProps } from "next/app";
import { DefaultSeo } from "next-seo";
import { Toaster } from "react-hot-toast";

import { ColorMode } from "@/components/ColorMode";
import { Toast } from "@/components/Toast";
import { BODY_FONT, HEADING_FONT } from "@/lib/fonts";

// Setup dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

function App({
  Component,
  pageProps,
}: AppProps<{
  colorMode?: string;
  dehydratedState?: any;
}>) {
  // Destruct user and colorMode so we don't pass it to the actual page. This removes redundant copies and ensures that any access to these variables are done through their respective providers
  const { dehydratedState, ...otherPageProps } = pageProps;

  useEffect(() => {
    if (typeof window !== "undefined") {
      dayjs.tz.setDefault(dayjs.tz.guess());
    }
  }, []);

  // usePanelbear(process.env.NEXT_PUBLIC_PANELBEAR_ID || "", {
  //   scriptSrc: "/bear.js",
  //   debug: process.env.NODE_ENV === "development",
  //   enabled: process.env.NODE_ENV === "production",
  // });
  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <DefaultSeo
        defaultTitle="Puzzlely"
        titleTemplate="%s - Puzzlely"
        description="An online puzzle game that's inspired by the BBC's Only Connect game show. Play user created puzzles or create your own to challenge your friends and other users."
        additionalMetaTags={[
          {
            name: "application-name",
            content: "Puzzlely",
          },
          {
            name: "color-scheme",
            content: "light dark",
          },
          {
            httpEquiv: "content-type",
            content: "text/html, charset=UTF-8",
          },
          {
            name: "keywords",
            content: [
              "puzzle",
              "puzzlely",
              "game",
              "only connect",
              "puzzgrid",
            ].join(","),
          },
        ]}
        openGraph={{
          type: "website",
          locale: "en_US",
          title: "Puzzlely",
          site_name: "Puzzlely",
          url: process.env.NEXT_PUBLIC_HOST_URL,
          images: [
            {
              width: 1200,
              height: 630,
              type: "image/png",
              url: `${process.env.NEXT_PUBLIC_HOST_URL}/ogImage.png`,
            },
          ],
        }}
      />

      <QueryClientProvider client={queryClient}>
        <Hydrate state={dehydratedState}>
          <ColorMode cookie={otherPageProps.colorMode}>
            <Toaster
              position="bottom-right"
              reverseOrder
              toastOptions={{
                duration: 5000,
              }}
            >
              {(t) => <Toast {...t} />}
            </Toaster>

            <div
              className={clsx(
                BODY_FONT.variable,
                HEADING_FONT.variable,

                "font-body"
              )}
            >
              <Component {...otherPageProps} />
            </div>
          </ColorMode>
        </Hydrate>
        {/* <ReactQueryDevtools /> */}
      </QueryClientProvider>
    </>
  );
}

export default App;
