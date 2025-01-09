import { useMemo } from "react";

import type { ShouldRevalidateFunctionArgs } from "react-router";

import { Header } from "@/components/header";
import {
	GameLayout,
	GameLayoutFooter,
	GameLayoutGrid,
	GameLayoutHeader,
	GameLayoutNavigation,
} from "@/layouts/game";
import { decodePuzzle } from "@/lib/decode-puzzle";
import { transformGameToPayload } from "@/lib/transform-game-to-payload";
import { API } from "@/services/api.server";
import { redirectWithInfo } from "@/services/toast.server";

import type { Route } from "./+types/_index";

/**
 * TODO: Save last cursor to a cookie to persist user's place
 * TODO: If not authenticated, save games to localStorage
 * TODO: Create error page
 */
export async function loader({ request }: Route.LoaderArgs) {
	const me = await API.me(request);
	// If the user hasn't completed their profile
	if (me.success && me.data.user && me.data.user.state === "PENDING" && !me.data.user.updated_at) {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw await redirectWithInfo("/profile/complete", {
			message: "Please complete your profile setup!",
		});
	}

	const puzzles = await API.puzzles.recent(request);
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

	if (!me.success || !me.data.user) {
		return {
			me: undefined,
			pageInfo: puzzles.data.page_info,
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
		};
	}

	const game = await API.games.get(request, edge.node.id);
	return {
		game: game.success ? transformGameToPayload(game.data) : undefined,
		me: me.data.user,
		pageInfo: puzzles.data.page_info,
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
	};
}

export function meta(_: Route.MetaArgs) {
	return [
		{
			title: "Puzzlely",
		},
	];
}

export function shouldRevalidate({
	defaultShouldRevalidate,
	formAction,
}: ShouldRevalidateFunctionArgs) {
	// If the user likes a puzzle or updates their profile, then, there's no need to revalidate current route's loader
	const needsRevalidation = ["/games/save", "/puzzles/like"].some((value) => {
		if (!formAction) {
			return false;
		}

		return formAction.includes(value);
	});
	if (!needsRevalidation) {
		return defaultShouldRevalidate;
	}

	return false;
}

export default function Component({ loaderData }: Route.ComponentProps) {
	const { game, me, pageInfo, puzzle } = useMemo(
		() => ({
			game: loaderData.game,
			me: loaderData.me,
			pageInfo: loaderData.pageInfo,
			puzzle: decodePuzzle(loaderData.puzzle),
		}),
		[loaderData],
	);

	return (
		<>
			<Header me={me} />

			<GameLayout game={game} me={me} puzzle={puzzle}>
				<GameLayoutHeader />
				<GameLayoutGrid />
				<GameLayoutNavigation pageInfo={pageInfo} puzzle={puzzle} />
				<GameLayoutFooter />
			</GameLayout>
		</>
	);
}
