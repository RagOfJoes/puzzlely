import type { LinksFunction } from "@remix-run/node";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";

import { Footer } from "@/components/footer";
import { TooltipProvider } from "@/components/tooltip";
import style from "@/styles/tailwind.css?url";

export const links: LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{ rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700;800;900",
	},
	{ rel: "stylesheet", href: style },
];

export default function App() {
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
			<body className="h-dvh bg-background">
				<TooltipProvider delayDuration={250}>
					<Outlet />
				</TooltipProvider>

				<Footer />

				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}
