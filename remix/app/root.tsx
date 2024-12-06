import { useEffect } from "react";

import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import { toast as notify } from "sonner";

import { Footer } from "@/components/footer";
import { Toaster } from "@/components/toaster";
import { getToast } from "@/services/toast.server";
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

export async function loader({ request }: LoaderFunctionArgs) {
	const { headers, toast } = await getToast(request);

	return json(
		{
			toast,
		},
		{
			headers,
		},
	);
}

export default function App() {
	const { toast } = useLoaderData<typeof loader>();

	useEffect(() => {
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
	}, [toast]);

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
				{/* App Layout  */}
				<Outlet />
				<Footer />

				{/* Remix */}
				<ScrollRestoration />
				<Scripts />

				{/* Global Providers */}
				<Toaster />
			</body>
		</html>
	);
}
