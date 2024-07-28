import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";

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

export const meta: MetaFunction = () => [
	{ charSet: "utf-8" },
	{ name: "viewport", content: "width=device-width, initial-scale=1.0" },
];

export default function App() {
	return (
		<html className="h-full" lang="en">
			<head>
				<link rel="icon" href="data:image/x-icon;base64,AA" />
				<Meta />
				<Links />
			</head>
			<body className="h-dvh bg-background">
				<TooltipProvider delayDuration={250}>
					<Outlet />
				</TooltipProvider>

				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}
