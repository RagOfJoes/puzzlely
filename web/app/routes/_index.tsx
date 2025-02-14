import { useEffect, useMemo } from "react";

import dayjs from "dayjs";
import { PlusIcon, UserIcon } from "lucide-react";
import {
	data,
	Link,
	redirect,
	useSearchParams,
	type ShouldRevalidateFunctionArgs,
} from "react-router";
import { toast as notify } from "sonner";

import { Button } from "@/components/button";
import { Header } from "@/components/header";
import { PuzzleInfiniteSlider } from "@/components/puzzle-infinite-slider";
import {
	GameLayout,
	GameLayoutFooter,
	GameLayoutGrid,
	GameLayoutHeader,
	GameLayoutNavigation,
} from "@/layouts/game";
import { cn } from "@/lib/cn";
import { decodePuzzle } from "@/lib/decode-puzzle";
import { getHistory, updateHistory } from "@/lib/history";
import { setSearchParams } from "@/lib/set-search-params";
import { transformGameToPayload } from "@/lib/transform-game-to-payload";
import { API } from "@/services/api.server";
import { history as historyCookie } from "@/services/cookies.server";
import { redirectWithInfo } from "@/services/toast.server";

import type { Route } from "./+types/_index";

/**
 * TODO: Create error page
 */
export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const cursor = url.searchParams.get("cursor");

	const cookie = request.headers.get("Cookie");
	const history = getHistory((await historyCookie.parse(cookie)) ?? {});

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

	const edge = puzzles.data.edges?.[0];
	// NOTE: Handle edge case for when the user completes either end of the list - the newest puzzle or oldest puzzle
	if (!edge && cursor && cursor.length !== 0) {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw redirect("/");
	}

	if (!edge) {
		return data(
			{
				game: undefined,
				history: undefined,
				me: me.success && me.data.user ? me.data.user : undefined,
				pageInfo: puzzles.data.page_info,
				puzzle: undefined,
			},
			{
				headers: {
					"Set-Cookie": await historyCookie.serialize(history),
				},
			},
		);
	}

	const updated = updateHistory(edge, history);

	if (!me.success || !me.data.user) {
		return data(
			{
				game: undefined,
				history,
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
			},
			{
				headers: {
					"Set-Cookie": await historyCookie.serialize(updated),
				},
			},
		);
	}

	const game = await API.games.get(request, edge.node.id);
	return data(
		{
			game: game.success ? transformGameToPayload(game.data) : undefined,
			history,
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
		},
		{
			headers: {
				"Set-Cookie": await historyCookie.serialize(updated),
			},
		},
	);
}

export function shouldRevalidate({
	defaultShouldRevalidate,
	formAction,
}: ShouldRevalidateFunctionArgs) {
	// If the user likes a puzzle or updates their profile, then, there's no need to revalidate current route's loader
	const needsRevalidation = ["/games/save", "/games/sync", "/puzzles/like"].some((value) => {
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
	const [searchParams] = useSearchParams();

	const { game, history, me, pageInfo, puzzle } = useMemo(
		() => ({
			game: loaderData.game,
			history: loaderData.history,
			me: loaderData.me,
			pageInfo: loaderData.pageInfo,
			puzzle: loaderData.puzzle ? decodePuzzle(loaderData.puzzle) : undefined,
		}),
		[loaderData],
	);

	useEffect(() => {
		if (!history) {
			return;
		}

		const lastPlayed = history.puzzles[0];
		if (!lastPlayed) {
			return;
		}

		const cursor = searchParams.get("cursor");
		// - If we're already on the lastPlayed cursor
		// - Handle edge case
		if (cursor === lastPlayed.cursor || puzzle?.id === lastPlayed.id) {
			return;
		}

		const raf = requestAnimationFrame(() => {
			const t = notify.info("Continue where you left off?", {
				action: (
					<div className="flex w-full basis-full justify-end gap-2">
						<Button
							onClick={() => {
								notify.dismiss(t);
							}}
							size="sm"
							variant="ghost"
						>
							Dismiss
						</Button>

						<Button asChild size="sm" variant="outline">
							<Link
								onClick={() => {
									notify.dismiss(t);
								}}
								preventScrollReset
								to={{
									search: setSearchParams(searchParams, {
										cursor: lastPlayed.cursor,
										direction: undefined,
									}),
								}}
							>
								Continue
							</Link>
						</Button>
					</div>
				),
				description: `You have an unfinished game from ${dayjs(lastPlayed.timestamp).fromNow()}`,
				duration: Infinity,
			});
		});

		// eslint-disable-next-line consistent-return
		return () => {
			cancelAnimationFrame(raf);
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!puzzle) {
		return (
			<>
				<Header me={me} />

				<main
					className={cn(
						"mx-auto h-[calc(100dvh-var(--header-height))] max-w-screen-md px-5 pb-2",

						"max-lg:min-h-[700px]",
					)}
				>
					<div className="flex h-full w-full flex-col items-center justify-center">
						<div className="w-full min-w-0">
							<div className="flex w-full flex-col gap-2">
								<PuzzleInfiniteSlider />

								<h1 className="mt-4 text-center text-2xl font-semibold leading-none">
									Congratulations!
								</h1>

								<div className="flex justify-center px-6">
									<p className="text-center text-muted-foreground">
										You've completed every existing puzzle. Come back later to play more exciting
										puzzles, or create your own to challenge others!
									</p>
								</div>

								<div className="mt-4 grid w-full min-w-0 grid-cols-2 gap-2">
									<Link to="/profile/">
										<Button className="w-full gap-2" size="lg" variant="outline">
											Go to profile <UserIcon className="h-4 w-4 shrink-0" />
										</Button>
									</Link>

									<Link to="/puzzles/create/">
										<Button className="w-full gap-2" size="lg">
											Create a puzzle <PlusIcon className="h-4 w-4 shrink-0" />
										</Button>
									</Link>
								</div>
							</div>
						</div>
					</div>
				</main>
			</>
		);
	}

	return (
		<>
			<Header me={me} />

			<GameLayout game={game} me={me} puzzle={puzzle}>
				<GameLayoutHeader />
				<GameLayoutGrid />
				<GameLayoutNavigation pageInfo={pageInfo} />
				<GameLayoutFooter />
			</GameLayout>
		</>
	);
}
