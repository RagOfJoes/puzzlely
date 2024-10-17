import { useState } from "react";

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import { Heart, History, Puzzle } from "lucide-react";

import { Header } from "@/components/header";
import { Tabs, TabsList, TabsTrigger } from "@/components/tabs";
import { hydrateUser } from "@/lib/hydrate-user";
import { API } from "@/services/api.server";

export type ValidTabs = "created" | "liked" | "history";

export async function loader({ params, request }: LoaderFunctionArgs) {
	const [me, user] = await Promise.all([
		API.me(request),
		API.users.get(request, { id: params.id ?? "" }),
	]);

	return json({
		me: me.payload?.user,
		user: user.payload!,
	});
}

export default function User() {
	const { user } = useLoaderData<typeof loader>();

	const [tab, setTab] = useState<ValidTabs>("created");

	return (
		<>
			<Header me={user ? hydrateUser(user) : undefined} />

			<main className="mx-auto h-[calc(100dvh-var(--header-height))] w-full max-w-screen-md px-5 pb-5">
				<article className="flex h-full w-full flex-col gap-1">
					<div className="flex gap-1 border bg-muted px-4 py-2">
						<div className="flex h-11 w-11 items-center justify-center bg-gradient-to-br from-primary to-secondary text-xl font-semibold text-muted">
							{user.username[0]}
						</div>

						<div className="flex items-center">
							{/* <p className="text-lg font-bold">{me.username}</p> */}
							<p className="text-lg font-semibold">test-user</p>
						</div>
					</div>

					<div className="flex w-full items-center gap-1">
						<div className="flex w-full flex-col gap-1 border bg-muted px-4 py-2">
							<p className="leading-none text-muted-foreground">Joined</p>

							<p className="font-semibold leading-none">
								{dayjs(user.created_at).format("MMM DD, YYYY")}
							</p>
						</div>

						<div className="flex w-full flex-col gap-1 border bg-muted px-4 py-2">
							<p className="leading-none text-muted-foreground">Updated at</p>

							<p className="font-semibold leading-none">
								{user.updated_at ? dayjs(user.updated_at).format("MMM DD, YYYY") : "N/A"}
							</p>
						</div>
					</div>

					<Tabs
						onValueChange={(newTab) => {
							if (newTab !== "created" && newTab !== "liked" && newTab !== "history") {
								return;
							}

							setTab(newTab);
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
					</Tabs>
				</article>
			</main>
		</>
	);
}
