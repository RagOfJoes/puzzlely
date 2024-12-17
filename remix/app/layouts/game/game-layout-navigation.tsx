import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import { ChevronLeftIcon, ChevronRightIcon, RotateCcwIcon } from "lucide-react";
import { Link, useFetcher, useLocation, useNavigation, useSearchParams } from "react-router";

import { Button } from "@/components/button";
import { useGameContext } from "@/hooks/use-game";
import { cn } from "@/lib/cn";
import { setSearchParams } from "@/lib/set-search-params";
import type { PageInfo } from "@/types/page-info";
import type { Puzzle } from "@/types/puzzle";

export type GameLayoutNavigationProps = Omit<
	ComponentPropsWithoutRef<typeof Primitive.div>,
	"children"
> & {
	pageInfo: PageInfo;
	puzzle: Puzzle;
};

export const GameLayoutNavigation = forwardRef<
	ElementRef<typeof Primitive.div>,
	GameLayoutNavigationProps
>(({ className, pageInfo, puzzle, ...props }, ref) => {
	const location = useLocation();
	const navigation = useNavigation();
	const [searchParams] = useSearchParams();

	const [state] = useGameContext();

	const fetcher = useFetcher({
		key: `games.upsert.${puzzle.id}`,
	});

	const isLoading =
		state.isLoading ||
		(navigation.state === "loading" && navigation.location?.pathname === location.pathname);
	const isSaving = fetcher.state === "submitting";

	return (
		<Primitive.div
			{...props}
			className={cn(
				"grid w-full grid-cols-4 gap-1 transition-opacity",

				className,
			)}
			ref={ref}
		>
			<div className="col-span-4 grid h-full grid-cols-4 gap-1">
				<Link
					aria-disabled={isLoading || isSaving || !searchParams.get("cursor")}
					className={cn(
						"col-span-2 h-full w-full",

						"aria-disabled:pointer-events-none aria-disabled:touch-none aria-disabled:select-none",
					)}
					preventScrollReset
					tabIndex={-1}
					to={{
						search: "",
					}}
				>
					<Button
						aria-label="Go to latest puzzles"
						className="w-full"
						disabled={isLoading || isSaving || !searchParams.has("cursor")}
						size="lg"
						variant="ghost"
					>
						<RotateCcwIcon className="h-4 w-4" />

						<div className="ml-2">Go to latest</div>
					</Button>
				</Link>

				<div className="col-span-2 flex h-full w-full items-center gap-1">
					<Link
						aria-disabled={isLoading || isSaving || !pageInfo.has_previous_page}
						className={cn(
							"h-full w-full min-w-0",

							"aria-disabled:pointer-events-none aria-disabled:touch-none aria-disabled:select-none",
						)}
						preventScrollReset
						tabIndex={-1}
						to={{
							search: setSearchParams(searchParams, {
								cursor: pageInfo.previous_cursor ?? undefined,
								direction: "B",
							}),
						}}
					>
						<Button
							aria-label="Go to previous game"
							className="w-full rounded-xl border bg-card"
							disabled={isLoading || isSaving || !pageInfo.has_previous_page}
							size="lg"
							variant="ghost"
						>
							<ChevronLeftIcon className="h-4 w-4" />
						</Button>
					</Link>

					<Link
						aria-disabled={isLoading || isSaving || !pageInfo.has_next_page}
						className={cn(
							"h-full w-full min-w-0",

							"aria-disabled:pointer-events-none aria-disabled:touch-none aria-disabled:select-none",
						)}
						preventScrollReset
						tabIndex={-1}
						to={{
							search: setSearchParams(searchParams, {
								cursor: pageInfo.next_cursor ?? undefined,
								direction: "F",
							}),
						}}
					>
						<Button
							aria-label="Go to next game"
							className="w-full rounded-xl border bg-card"
							disabled={isLoading || isSaving || !pageInfo.has_next_page}
							size="lg"
							variant="ghost"
						>
							<ChevronRightIcon className="h-4 w-4" />
						</Button>
					</Link>
				</div>
			</div>
		</Primitive.div>
	);
});
GameLayoutNavigation.displayName = "GameLayoutNavigation";
