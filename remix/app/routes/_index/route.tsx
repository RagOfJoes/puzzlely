import type { LoaderFunctionArgs, MetaFunction, TypedResponse } from "@remix-run/node";
import type { ShouldRevalidateFunctionArgs } from "@remix-run/react";
import { json, useLoaderData } from "@remix-run/react";

import { Header } from "@/components/header";
import { GameProvider, useGame } from "@/hooks/use-game";
import { cn } from "@/lib/cn";
import { createGame } from "@/lib/create-game";
import { hydrateGame } from "@/lib/hydrate-game";
import { hydrateUser } from "@/lib/hydrate-user";
import { API } from "@/services/api.server";
import type { Game } from "@/types/game";
import type { PageInfo } from "@/types/page-info";
import type { User } from "@/types/user";

import { IndexFooter } from "./_index.footer";
import { IndexGrid } from "./_index.grid";
import { IndexHeader } from "./_index.header";

// Expected response from the loader
type LoaderResponse = {
	game: Game;
	me?: User;
	pageInfo: PageInfo;
};

export async function loader({
	request,
}: LoaderFunctionArgs): Promise<TypedResponse<LoaderResponse>> {
	const [me, puzzles] = await Promise.all([API.me(request), API.puzzles.recent(request)]);

	if (!puzzles.success || !puzzles.data) {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw new Response("Failed to fetch puzzles!", { status: 500 });
	}

	// TODO: Render error here
	const edge = puzzles.data.edges?.[0];
	if (!edge) {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw new Response("Failed to fetch puzzles!", { status: 500 });
	}

	return json({
		game: createGame({
			me: me.success ? me.data.user : undefined,
			puzzle: {
				...edge.node,
				groups: edge.node.groups.map((group) => ({
					...group,
					blocks: group.blocks.map((block) => ({
						...block,
						value: btoa(block.value),
					})),
				})),
			},
		}),
		me: me.success ? me.data.user : undefined,
		pageInfo: puzzles.data.page_info,
	});
}

export const meta: MetaFunction<typeof loader> = () => [
	{
		title: "Puzzlely",
	},
];

export function shouldRevalidate({
	defaultShouldRevalidate,
	formAction,
}: ShouldRevalidateFunctionArgs) {
	if (!formAction?.includes("/puzzles/like/")) {
		return defaultShouldRevalidate;
	}

	// Don't need to re-run loader when the user likes the puzzle
	return false;
}

// TODO: Create different view depending on the result of the loader
export default function Index() {
	const data = useLoaderData<LoaderResponse>();

	const ctx = useGame({
		game: hydrateGame(data.game),
	});

	return (
		<>
			<Header me={data.me ? hydrateUser(data.me) : undefined} />

			<main
				className={cn(
					"mx-auto h-[calc(100dvh-var(--header-height))] max-w-screen-md px-5 pb-2",

					"max-lg:min-h-[700px]",
				)}
			>
				<div className="flex h-full w-full max-w-3xl flex-col gap-1">
					<GameProvider value={ctx}>
						<IndexHeader />
						<IndexGrid />
						<IndexFooter />
					</GameProvider>
				</div>
			</main>
		</>
	);
}
