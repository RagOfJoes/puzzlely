import clsx from "clsx";
import NextDocument, { Head, Html, Main, NextScript } from "next/document";

import getColorMode from "@/lib/getColorMode";

class Document extends NextDocument {
  render() {
    const colorMode = getColorMode(
      // eslint-disable-next-line no-underscore-dangle
      this.props.__NEXT_DATA__.props?.pageProps?.colorMode ?? ""
    );

    return (
      <Html
        lang="en"
        data-theme={colorMode ?? "dark"}
        style={{ colorScheme: colorMode ?? "dark" }}
        className={clsx(
          "scroll-smooth",

          "motion-reduce:scroll-auto",
          "selection:bg-cyan selection:text-base",

          {
            "puzzlely-light": colorMode === "light",
            "puzzlely-dark dark": colorMode === "dark",
          }
        )}
      >
        <Head />
        <body className="bg-base text-text antialiased">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default Document;
