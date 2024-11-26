import { useState } from "react";

import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, redirect, useLoaderData, useMatches, useNavigate } from "@remix-run/react";
import dayjs from "dayjs";
import { EditIcon, Heart, History, Puzzle } from "lucide-react";

import { Button } from "@/components/button";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/dialog";
import { Header } from "@/components/header";
import { Tabs, TabsList, TabsTrigger } from "@/components/tabs";
import { cn } from "@/lib/cn";
import { hydrateUser } from "@/lib/hydrate-user";
import { requireUser } from "@/lib/require-user";

export type ValidTabs = "created" | "liked" | "history";

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const split = url.pathname.split("/").filter((str) => str.length > 0);
	switch (split[split.length - 1]) {
		case "created":
			break;
		case "liked":
			break;
		case "history":
			break;
		default:
			return redirect("/profile/created/");
	}

	const me = await requireUser(request);

	return json({
		me,
	});
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	if (!data) {
		return [
			{
				title: "Profile | Puzzlely",
			},
		];
	}

	return [
		{
			title: `${data.me.username} | Puzzlely`,
		},
	];
};

export default function Profile() {
	const { me } = useLoaderData<typeof loader>();
	const navigate = useNavigate();
	const matches = useMatches();

	const [tab, setTab] = useState<ValidTabs>(() => {
		const match = matches[matches.length - 1];
		switch (match?.id) {
			case "routes/profile.history":
				return "history";
			case "routes/profile.liked":
				return "liked";
			default:
				return "created";
		}
	});

	return (
		<>
			<Header me={me ? hydrateUser(me) : undefined} />

			<main className="mx-auto min-h-[calc(100dvh-var(--header-height))] w-full max-w-screen-md px-5 pb-5">
				<article className="flex h-full w-full flex-col gap-1">
					<div className="flex gap-2 border bg-muted px-4 py-2">
						<div className="flex h-11 w-11 shrink-0 items-center justify-center bg-gradient-to-br from-primary to-secondary text-xl font-semibold text-muted">
							{me.username[0]}
						</div>

						<Dialog>
							<DialogTrigger asChild>
								<Button
									aria-label="Edit profile"
									className={cn(
										"w-full justify-start gap-2 overflow-hidden p-0 text-lg font-bold",

										"hover:bg-transparent",
									)}
									size="lg"
									variant="ghost"
								>
									<span className="truncate">{me.username}</span>

									<EditIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
								</Button>
							</DialogTrigger>

							<DialogContent>
								<DialogHeader>
									<DialogTitle>Edit Profile</DialogTitle>
									<DialogDescription className="sr-only">Edit Profile</DialogDescription>
								</DialogHeader>
							</DialogContent>
						</Dialog>
					</div>

					<div className="flex w-full items-center gap-1">
						<div className="flex w-full flex-col gap-1 border bg-muted px-4 py-2">
							<p className="leading-none text-muted-foreground">Joined</p>

							<p className="font-semibold leading-none">
								{dayjs(me.created_at).format("MMM DD, YYYY")}
							</p>
						</div>

						<div className="flex w-full flex-col gap-1 border bg-muted px-4 py-2">
							<p className="leading-none text-muted-foreground">Updated at</p>

							<p className="font-semibold leading-none">
								{me.updated_at ? dayjs(me.updated_at).format("MMM DD, YYYY") : "N/A"}
							</p>
						</div>
					</div>

					<Tabs
						onValueChange={(newTab) => {
							if (newTab !== "created" && newTab !== "liked" && newTab !== "history") {
								return;
							}

							setTab(newTab);

							navigate(`/profile/${newTab}/`, {
								preventScrollReset: true,
								// viewTransition: true,
							});
						}}
						value={tab}
					>
						<TabsList className="w-full">
							<TabsTrigger value="created">
								<Puzzle className="h-4 w-4" />
								Created
							</TabsTrigger>
							<TabsTrigger value="liked">
								<Heart className="h-4 w-4" />
								Liked
							</TabsTrigger>
							<TabsTrigger value="history">
								<History className="h-4 w-4" />
								History
							</TabsTrigger>
						</TabsList>

						<Outlet />
					</Tabs>
				</article>
			</main>
		</>
	);
}
