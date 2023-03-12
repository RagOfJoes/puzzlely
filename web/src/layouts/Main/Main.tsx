import { forwardRef, useMemo, useState } from "react";

import { Slot } from "@radix-ui/react-slot";
import clsx from "clsx";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import { IoCreate, IoLogIn, IoLogOut, IoPerson } from "react-icons/io5";

import { useColorModeCtx } from "@/components/ColorMode";
import {
  Sidebar,
  SidebarHeading,
  SidebarIcon,
  SidebarItem,
} from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import useMe from "@/hooks/useMe";
import useSidebarLinks from "@/hooks/useSidebarLinks";
import { PROFILE_ROUTE } from "@/lib/constants";

import type { MainLayoutProps } from "./types";

export const MainLayout = forwardRef<HTMLDivElement, MainLayoutProps>(
  (props, ref) => {
    const { asChild, breadcrumbLinks = [], children, ...rest } = props;

    const router = useRouter();
    const { data: me } = useMe();
    const { colorMode } = useColorModeCtx();
    const links = useSidebarLinks(router, me);

    const [isOpen, toggleIsOpen] = useState(false);

    const Container = asChild ? Slot : "div";
    const isProfile = useMemo(() => {
      return me && router.pathname.split("/")?.[1] === PROFILE_ROUTE;
    }, [me, router.pathname]);

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

        <div className="relative mx-auto max-w-[1500px] overflow-hidden">
          <Sidebar isOpen={isOpen}>
            {links.map((link) => {
              const { path, icon, title, isActive, isSection } = link;

              if (isSection) {
                return <SidebarHeading key={path}>{title}</SidebarHeading>;
              }

              return (
                <SidebarItem key={path} href={path} isActive={isActive}>
                  <SidebarIcon>{icon}</SidebarIcon>
                  {title}
                </SidebarItem>
              );
            })}

            <div className="flex h-full w-full flex-col items-start justify-end gap-2">
              <SidebarHeading>Account</SidebarHeading>

              {me ? (
                <>
                  <SidebarItem href="/profile/" isActive={!!isProfile}>
                    <SidebarIcon>
                      <IoPerson />
                      Profile
                    </SidebarIcon>
                  </SidebarItem>
                  <SidebarItem href="/api/logout">
                    <SidebarIcon>
                      <IoLogOut />
                    </SidebarIcon>
                    Sign out
                  </SidebarItem>
                </>
              ) : (
                <>
                  <SidebarItem href="/signup/">
                    <SidebarIcon>
                      <IoCreate />
                    </SidebarIcon>
                    Sign up
                  </SidebarItem>
                  <SidebarItem href="/login/">
                    <SidebarIcon>
                      <IoLogIn />
                    </SidebarIcon>
                    Sign in
                  </SidebarItem>
                </>
              )}
            </div>
          </Sidebar>

          <div
            className={clsx(
              "relative left-0 z-[1] ml-64 flex min-h-screen flex-1 justify-center overflow-y-auto overflow-x-hidden transition-[left,margin-left] duration-150 ease-linear",

              "max-lg:ml-0",

              {
                "max-lg:left-0": !isOpen,
                "max-lg:left-64": isOpen,
              }
            )}
          >
            <Container
              ref={ref}
              className="w-full max-w-7xl pt-5 pb-10"
              {...rest}
            >
              <Topbar
                isOpen={isOpen}
                links={breadcrumbLinks}
                toggleIsOpen={toggleIsOpen}
              />

              <main className="px-5 pt-[calc(34px+0.5rem)]">{children}</main>
            </Container>
          </div>
        </div>
      </>
    );
  }
);

MainLayout.displayName = "MainLayout";
