import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import { Link, useLocation, useNavigation } from "@remix-run/react";
import dayjs from "dayjs";

import { Skeleton } from "@/components/skeleton";
import { useGameContext } from "@/hooks/use-game";
import { cn } from "@/lib/cn";
import type { User } from "@/types/user";

export type GameLayoutFooterProps = Omit<
	ComponentPropsWithoutRef<typeof Primitive.div>,
	"children"
> & {
	me?: User;
};

export const GameLayoutFooter = forwardRef<ElementRef<typeof Primitive.div>, GameLayoutFooterProps>(
	({ className, me, ...props }, ref) => {
		const location = useLocation();
		const navigation = useNavigation();

		const [state] = useGameContext();

		const isLoading =
			navigation.location?.pathname === location.pathname && navigation.state === "loading";

		return (
			<Primitive.div
				{...props}
				className={cn(
					"mt-2 flex gap-1",

					className,
				)}
				ref={ref}
			>
				<div className="flex w-full min-w-0 basis-1/2 items-center">
					{isLoading ? (
						<Skeleton className="inline-flex min-w-0 select-none items-center px-1 py-0.5">
							<p className="invisible w-full truncate text-sm font-semibold">EASY</p>
						</Skeleton>
					) : (
						<div
							className={cn(
								"inline-flex min-w-0 items-center px-1 py-0.5",

								"data-[difficulty='EASY']:bg-success data-[difficulty='EASY']:text-success-foreground data-[difficulty='EASY']:animate-none",
								"data-[difficulty='HARD']:animate-none data-[difficulty='HARD']:bg-destructive data-[difficulty='HARD']:text-destructive-foreground",
								"data-[difficulty='MEDIUM']animate-none data-[difficulty='MEDIUM']:bg-warning data-[difficulty='MEDIUM']:text-warning-foreground",
							)}
							data-difficulty={state.puzzle.difficulty}
						>
							<p className="w-full truncate text-sm font-semibold">{state.puzzle.difficulty}</p>
						</div>
					)}
				</div>

				<div className="w-full min-w-0 basis-1/2 ">
					<div className="flex h-full w-full flex-col items-end justify-center text-end">
						{isLoading ? (
							<div className="min-w-0">
								<Skeleton className="w-auto text-transparent">
									<p className="invisible w-full">Username</p>
								</Skeleton>
							</div>
						) : (
							<Link
								className={cn(
									"w-full min-w-0 no-underline outline-none ring-offset-background transition-all",

									"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
								)}
								to={
									me && state.puzzle.created_by.id === me.id
										? "/profile/created/"
										: `/users/${state.puzzle.created_by.id}/created/`
								}
							>
								<p className="w-full truncate">{state.puzzle.created_by.username}</p>
							</Link>
						)}

						{isLoading ? (
							<Skeleton>
								<p className="invisible text-xs font-medium">{dayjs().format("MMMM DD, YYYY")}</p>
							</Skeleton>
						) : (
							<time
								className="text-xs font-medium text-muted-foreground"
								dateTime={dayjs(state.puzzle.created_at).toISOString()}
							>
								{dayjs(state.puzzle.created_at).format("MMMM DD, YYYY")}
							</time>
						)}
					</div>
				</div>
			</Primitive.div>
		);
	},
);
GameLayoutFooter.displayName = "GameLayoutFooter";
