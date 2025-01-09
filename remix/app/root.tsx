import { useEffect } from "react";

import { data, Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { toast as notify } from "sonner";

import { Footer } from "@/components/footer";
import { ScrollArea } from "@/components/scroll-area";
import { Toaster } from "@/components/toaster";
import { TooltipProvider } from "@/components/tooltip";
import { getToast } from "@/services/toast.server";
import style from "@/styles/tailwind.css?url";

import type { Route } from "./+types/root";
import { GameLocalProvider, useGameLocal } from "./hooks/use-game-local";

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{ rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700;800;900",
	},
	{ rel: "stylesheet", href: style },
];

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
				<link rel="icon" href="data:image/x-icon;base64,AA" />
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta httpEquiv="content-type" content="text/html, charset=UTF-8" />

				<meta
					name="description"
					content="An online puzzle game that's inspired by the BBC's Only Connect game show. Play user created puzzles or create your own to challenge your friends and other users."
				/>
				<meta
					name="keywords"
					content="puzzle,puzzlely,connections,nyt,new york times,game,only connect,puzzgrid"
				/>

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
