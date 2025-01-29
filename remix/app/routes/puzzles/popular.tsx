import { HomeIcon, PlusIcon } from "lucide-react";
import { Link, type ShouldRevalidateFunctionArgs } from "react-router";

import { Button } from "@/components/button";
import { Header } from "@/components/header";
import { PuzzleSummaryCardInfiniteSlider } from "@/components/puzzle-summary-card-infinite-slider";
import { cn } from "@/lib/cn";
import { API } from "@/services/api.server";
import { redirectWithInfo } from "@/services/toast.server";

import type { Route } from "./+types/popular";

/**
 * TODO: Save last cursor to a cookie to persist user's place
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

	return {
		me: me.success && me.data.user ? me.data.user : undefined,
	};
}

export function meta(_: Route.MetaArgs) {
	return [
		{
			title: "Popular puzzles | Puzzlely",
		},
	];
}

export function shouldRevalidate({
	defaultShouldRevalidate,
	formAction,
}: ShouldRevalidateFunctionArgs) {
	// If the user likes a puzzle or updates their profile, then, there's no need to revalidate current route's loader
	const needsRevalidation = ["/puzzles/like"].some((value) => {
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
	return (
		<>
			<Header me={loaderData.me} />

			<main
				className={cn(
					"mx-auto h-[calc(100dvh-var(--header-height))] w-screen max-w-screen-md overflow-x-hidden px-5 pb-2",

					"max-lg:min-h-[700px]",
				)}
			>
				<div className="flex h-full w-full flex-col items-center justify-center">
					<div className="w-full min-w-0">
						<div className="flex w-full flex-col gap-2">
							<PuzzleSummaryCardInfiniteSlider />

							<h1 className="mt-4 text-center text-2xl font-semibold leading-none">
								In construction
							</h1>

							<div className="flex justify-center px-6">
								<p className="text-center text-muted-foreground">
									We're still building this feature. Please come back later to check it out! For now
									you can play the most recent puzzles or create your own to challenge others!
								</p>
							</div>

							<div className="mt-4 grid w-full min-w-0 grid-cols-2 gap-2">
								<Link to="/">
									<Button className="w-full gap-2" size="lg" variant="outline">
										Go home <HomeIcon className="h-4 w-4 shrink-0" />
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
