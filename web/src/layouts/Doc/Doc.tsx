import { forwardRef } from "react";

import clsx from "clsx";
import dayjs from "dayjs";
import Link from "next/link";
import { NextSeo } from "next-seo";
import { MdCopyright } from "react-icons/md";

import { useColorModeCtx } from "@/components/ColorMode";
import { PuzzlelyIcon } from "@/components/PuzzlelyIcon";

import type { DocLayoutProps } from "./types";

export const DocLayout = forwardRef<HTMLElement, DocLayoutProps>(
  (props, ref) => {
    const { children, className, title, ...other } = props;

    const { colorMode } = useColorModeCtx();

    return (
      <>
        <NextSeo
          additionalLinkTags={[
            {
              rel: "manifest",
              href: `/${colorMode}/site.webmanifest`,
            },
            {
              rel: "icon",
              href: `/${colorMode}/favicon.ico`,
            },
            {
              rel: "icon",
              sizes: "16x16",
              type: "image/png",
              href: `/${colorMode}/favicon-16x16.png`,
            },
            {
              rel: "icon",
              sizes: "32x32",
              type: "image/png",
              href: `/${colorMode}/favicon-32x32.png`,
            },
            {
              rel: "icon",
              type: "image/png",
              sizes: "16x16",
              href: `/${colorMode}/favicon-16x16.png`,
            },
            {
              sizes: "180x180",
              rel: "apple-touch-icon",
              href: `/${colorMode}/apple-touch-icon.png`,
            },
          ]}
          additionalMetaTags={[
            {
              name: "theme-color",
              content: colorMode === "dark" ? "#282c34" : "#f4f4f7",
            },
          ]}
        />

        <div className="m-auto flex max-w-5xl flex-col items-start py-6 px-4">
          <header>
            <Link
              href="/"
              className={clsx(
                "flex items-center no-underline outline-none",

                "focus-visible:ring"
              )}
            >
              <PuzzlelyIcon className="h-10 w-10" />

              <h1
                className={clsx(
                  "relative ml-3 font-heading text-xl font-bold",

                  'before:absolute before:left-0 before:right-2.5 before:bottom-1 before:z-[-1] before:h-1.5 before:bg-cyan before:opacity-80 before:content-[""]'
                )}
              >
                Puzzlely
              </h1>
            </Link>
          </header>

          <main
            {...other}
            ref={ref}
            className={clsx(
              "flex h-full w-full items-center",

              className
            )}
          >
            <article className="w-full">
              <div className="w-full py-12">
                <div className="flex w-full justify-center">
                  <h1 className="font-heading text-3xl font-bold">{title}</h1>
                </div>

                {children}
              </div>
            </article>
          </main>

          <footer>
            <div className="flex items-center justify-start gap-1 text-subtle">
              <MdCopyright size={12} />
              <p className="text-xs leading-none">
                Puzzlely {dayjs().tz().year()}
              </p>
            </div>
          </footer>
        </div>
      </>
    );
  }
);

DocLayout.displayName = "DocLayout";
