import { useMemo } from "react";

import type { ShouldRevalidateFunctionArgs } from "react-router";

import { GameLayout, GameLayoutFooter, GameLayoutGrid, GameLayoutHeader } from "@/layouts/game";
import { decodePuzzle } from "@/lib/decode-puzzle";
import { transformGameToPayload } from "@/lib/transform-game-to-payload";
import { API } from "@/services/api.server";
import { redirectWithInfo } from "@/services/toast.server";

import type { Route } from "./+types/play.$id";

export async function loader({ params, request }: Route.LoaderArgs) {
	const me = await API.me(request);
	// If the user hasn't completed their profile
	if (me.success && me.data.user && me.data.user.state === "PENDING" && !me.data.user.updated_at) {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw redirectWithInfo("/profile/complete", {
			message: "Please complete your profile setup!",
		});
	}

	const puzzle = await API.puzzles.get(request, params.id ?? "");
	if (!puzzle.success) {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw new Response("Failed to fetch puzzles!", { status: 404 });
	}

	if (!me.success || !me.data.user) {
		return {
			me: undefined,
			puzzle: {
				...puzzle.data,
				groups: puzzle.data.groups.map((group) => ({
					...group,
					blocks: group.blocks.map((block) => ({
						...block,
						value: btoa(block.value),
					})),
				})),
			},
		};
	}

	const game = await API.games.get(request, puzzle.data.id);
	return {
		game: game.success ? transformGameToPayload(game.data) : undefined,
		me: me.data.user,
		puzzle: {
			...puzzle.data,
			groups: puzzle.data.groups.map((group) => ({
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
	const { game, me, puzzle } = useMemo(
		() => ({
			game: loaderData.game,
			me: loaderData.me,
			puzzle: decodePuzzle(loaderData.puzzle),
		}),
		[loaderData],
	);

	return (
		<GameLayout game={game} me={me} puzzle={puzzle}>
			<GameLayoutHeader />
			<GameLayoutGrid />
			<GameLayoutFooter />
		</GameLayout>
	);
}
