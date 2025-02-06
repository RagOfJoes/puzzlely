import { useEffect } from "react";

import dayjs from "dayjs";
import RelativeTime from "dayjs/plugin/relativeTime";
import { data, Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { toast as notify } from "sonner";

import { Footer } from "@/components/footer";
import { ScrollArea } from "@/components/scroll-area";
import { Toaster } from "@/components/toaster";
import { TooltipProvider } from "@/components/tooltip";
import { GameLocalProvider, useGameLocal } from "@/hooks/use-game-local";
import { getToast } from "@/services/toast.server";
import style from "@/styles/tailwind.css?url";

import type { Route } from "./+types/root";

dayjs.extend(RelativeTime);

export const links: Route.LinksFunction = () => [
	// SEO fields
	{
		rel: "apple-touch-icon",
		href: "/apple-touch-icon.png",
		sizes: "180x180",
		type: "image/png",
	},
	{
		rel: "icon",
		href: "/favicon-16x16.png",
		sizes: "16x16",
		type: "image/png",
	},
	{
		rel: "icon",
		href: "/favicon-32x32.png",
		sizes: "32x32",
		type: "image/png",
	},
	{
		rel: "shortcut icon",
		href: "/favicon.ico",
		type: "image/x-icon",
	},
	{
		rel: "manifest",
		href: "/site.webmanifest",
	},

	// Fonts and styles
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{ rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700;800;900",
	},
	{ rel: "stylesheet", href: style },
];

export function meta(_: Route.MetaArgs) {
	return [
		{
			title: "Puzzlely",
		},
		{
			name: "description",
			content:
				"What if Connections, but infinite? No more waiting until tomorrow, no more rationing your daily word-grouping fix. Just pure, unbridled classification chaos.",
		},
	];
}

export async function loader({ request }: Route.LoaderArgs) {
	const { headers, toast } = await getToast(request);

	return data(
		{
			toast,
		},
		{
			headers,
		},
	);
}

export default function Component({ loaderData }: Route.ComponentProps) {
	const local = useGameLocal();

	// Renders toast
	useEffect(() => {
		const toast = loaderData.toast;
		if (!toast) {
			return;
		}

		const raf = requestAnimationFrame(() => {
			switch (toast.type) {
				case "error":
					notify.error(toast.message, {
						description: toast.description,
					});
					break;
				case "info":
					notify.info(toast.message, {
						description: toast.description,
					});
					break;
				case "success":
					notify.success(toast.message, {
						description: toast.description,
					});
					break;
				case "warning":
					notify.warning(toast.message, {
						description: toast.description,
					});
					break;
				default:
					notify.message(toast.message, {
						description: toast.description,
					});
					break;
			}
		});

		// eslint-disable-next-line consistent-return
		return () => {
			cancelAnimationFrame(raf);
		};
	}, [loaderData.toast]);

	return (
		<html className="h-full" lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta httpEquiv="content-type" content="text/html, charset=UTF-8" />

				<meta name="application-name" content="Puzzlely" />
				<meta name="color-scheme" content="dark" />
				<meta
					name="keywords"
					content="puzzle,puzzlely,connections,nyt,new york times,nyt,game,only connect,puzzgrid,ragofjoes,victor ragojos"
				/>

				{/* Open Graph */}
				<meta
					property="og:description"
					content="What if Connections, but infinite? No more waiting until tomorrow, no more rationing your daily word-grouping fix. Just pure, unbridled classification chaos."
				/>
				<meta property="og:image" content={`${import.meta.env.VITE_HOST_URL}/og.png`} />
				<meta property="og:title" content="Puzzlely" />
				<meta property="og:site_name" content="Puzzlely" />
				<meta property="og:type" content="website" />
				<meta property="og:url" content={import.meta.env.VITE_HOST_URL} />

				{/* Twitter/X */}
				<meta name="twitter:card" content="summary_large_image" />
				<meta
					name="twitter:description"
					content="What if Connections, but infinite? No more waiting until tomorrow, no more rationing your daily word-grouping fix. Just pure, unbridled classification chaos."
				/>
				<meta name="twitter:image" content={`${import.meta.env.VITE_HOST_URL}/og.png`} />
				<meta name="twitter:title" content="Puzzlely" />
				<meta property="twitter:domain" content={import.meta.env.VITE_HOST_URL} />
				<meta property="twitter:url" content={import.meta.env.VITE_HOST_URL} />

				<Meta />
				<Links />
			</head>
			<body className="h-dvh overflow-hidden bg-background">
				{/* App Layout  */}
				<TooltipProvider delayDuration={150}>
					<ScrollArea className="h-full">
						<GameLocalProvider value={local}>
							<Outlet />
						</GameLocalProvider>
						<Footer />
					</ScrollArea>
				</TooltipProvider>

				{/* Remix */}
				<ScrollRestoration />
				<Scripts />

				{/* Global Providers */}
				<Toaster />
			</body>
		</html>
	);
}
