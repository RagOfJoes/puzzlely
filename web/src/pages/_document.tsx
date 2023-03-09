import React from "react";

import NextDocument, { Head, Html, Main, NextScript } from "next/document";

class Document extends NextDocument {
  render() {
    return (
      <Html
        lang="en"
        className="scroll-smooth selection:bg-muted/40 motion-reduce:scroll-auto"
      >
        <Head />
        <body className="bg-base font-body text-text antialiased">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default Document;
