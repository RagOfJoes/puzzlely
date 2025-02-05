import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef, useCallback, useMemo } from "react";

import {
	LogInIcon,
	LogOutIcon,
	MenuIcon,
	PlusIcon,
	SaveAllIcon,
	TrendingUpIcon,
	UserIcon,
	UserPlusIcon,
} from "lucide-react";
import { Form, Link, useNavigate } from "react-router";
import { toast as notify } from "sonner";

import { Button } from "@/components/button";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/drawer";
import { PuzzlelyIcon } from "@/components/puzzlely-icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import { useFetcherWithPromise } from "@/hooks/use-fetcher-with-promise";
import { useGameLocalContext } from "@/hooks/use-game-local";
import { cn } from "@/lib/cn";
import type { action } from "@/routes/games.sync.$id";
import type { User } from "@/types/user";

export type HeaderProps = Omit<ComponentPropsWithoutRef<"header">, "children"> & {
	me?: User;
};

export const Header = forwardRef<ElementRef<"header">, HeaderProps>(
	({ className, me, ...props }, ref) => {
		const { submit } = useFetcherWithPromise<typeof action>({
			key: "games.sync",
		});
		const navigate = useNavigate();

		const [state, actions] = useGameLocalContext();

		const unsaved = useMemo(() => Object.keys(state.games), [state.games]);

		const onSync = useCallback(async () => {
			const id = notify.loading("Synching games...", {
				description: "Failed: 0, Saved: 0.",
			});

			let failed = 0;
			let succeeded = 0;

			for (let i = 0; i < unsaved.length; i += 1) {
				const puzzleID = unsaved[i];
				if (!puzzleID) {
					// eslint-disable-next-line no-continue
					continue;
				}

				const value = state.games[puzzleID];
				if (!value) {
					// eslint-disable-next-line no-continue
					continue;
				}

				// eslint-disable-next-line no-await-in-loop
				const data = await submit(JSON.stringify(value), {
					action: `/games/sync/${puzzleID}`,
					encType: "application/json",
					method: "PUT",
				});

				if (!data || !data.success) {
					failed += 1;
				} else {
					actions.remove(puzzleID);
					succeeded += 1;
				}

				notify.loading("Synching games...", {
					description: `Failed: ${failed}, Saved: ${succeeded}.`,
					id,
				});
			}

			notify.success("Synched games!", {
				description: `Failed: ${failed}, Saved: ${succeeded}.`,
				id,
			});
		}, [actions, state.games, submit, unsaved]);

		return (
			<header
				{...props}
				className={cn(
					"sticky top-0 z-50 flex h-[var(--header-height)] w-full items-center justify-center opacity-100",
					// Background
					"bg-transparent backdrop-blur-[3px] [background-image:radial-gradient(transparent_1px,_hsl(var(--background))_1px)] [background-size:4px_4px] [mask-image:_linear-gradient(rgb(0,0,0)_60%,_rgba(0,0,0,0)_100%)]",

					className,
				)}
				ref={ref}
			>
				<div className="flex w-full min-w-0 max-w-screen-md justify-between px-1.5">
					<ul className="flex min-w-0 gap-1">
						<Drawer direction="left">
							<li>
								<DrawerTrigger asChild>
									<Button
										aria-label="Open navigation menu"
										className="h-11 w-11"
										size="icon"
										variant="ghost"
									>
										<MenuIcon className="h-4 w-4" />
									</Button>
								</DrawerTrigger>
							</li>

							<DrawerContent>
								<div className="flex w-full overflow-hidden rounded-xl border bg-popover">
									<nav className="flex w-full flex-col">
										<DrawerHeader className="w-full">
											<DrawerTitle>
												<Link
													aria-label="Go home"
													to="/"
													className={cn(
														"flex items-center no-underline outline-none ring-offset-background transition-all",

														"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
													)}
												>
													<PuzzlelyIcon className="h-11 w-11" />

													<h1 className="relative select-none text-lg font-semibold">Puzzlely</h1>
												</Link>
											</DrawerTitle>
											<DrawerDescription className="sr-only">Menu</DrawerDescription>
										</DrawerHeader>

										<div className="mt-8 flex w-full flex-col gap-1 px-4">
											<Link tabIndex={-1} to="/puzzles/create/">
												<Button
													className={cn(
														"w-full gap-2 rounded-xl shadow-[0_0_12px_1px] shadow-primary",

														"[&>svg]:data-[is-liked=true]:fill-current",
													)}
													size="lg"
												>
													<PlusIcon className="h-4 w-4" />
													Create a puzzle
												</Button>
											</Link>
										</div>

										<div className="mt-8 flex w-full flex-col gap-2 px-4 pb-4">
											<h2 className="text-sm font-semibold uppercase">Menu</h2>

											<Link tabIndex={-1} to="/puzzles/popular/">
												<Button
													className="group/button h-auto w-full justify-start gap-3 px-3 py-3"
													size="lg"
													variant="ghost"
												>
													<div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground p-2 text-background">
														<TrendingUpIcon className="h-4 w-4" />
													</div>
													Popular
												</Button>
											</Link>
										</div>

										<div className="mt-auto flex w-full flex-col gap-2 px-4 pb-4">
											<h2 className="text-sm font-semibold uppercase">Account</h2>

											{me ? (
												<>
													<Link tabIndex={-1} to="/profile/">
														<Button
															className="group/button h-auto w-full justify-start gap-3 px-3 py-3"
															size="lg"
															variant="ghost"
														>
															<div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground p-2 text-background">
																<UserIcon className="h-4 w-4" />
															</div>
															Profile
														</Button>
													</Link>

													<Form method="delete" action="/logout">
														<Button
															className="group/button h-auto w-full justify-start gap-3 px-3 py-3"
															size="lg"
															variant="ghost"
														>
															<div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground p-2 text-background">
																<LogOutIcon className="h-4 w-4" />
															</div>
															Logout
														</Button>
													</Form>
												</>
											) : (
												<>
													<Link tabIndex={-1} to="/signup/">
														<Button
															className="group/button h-auto w-full justify-start gap-3 px-3 py-3"
															size="lg"
															variant="ghost"
														>
															<div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground p-2 text-background">
																<UserPlusIcon className="h-4 w-4" />
															</div>
															Sign Up
														</Button>
													</Link>

													<Link tabIndex={-1} to="/login/">
														<Button
															className="group/button h-auto w-full justify-start gap-3 px-3 py-3"
															size="lg"
															variant="ghost"
														>
															<div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground p-2 text-background">
																<LogInIcon className="h-4 w-4" />
															</div>
															Login
														</Button>
													</Link>
												</>
											)}
										</div>
									</nav>
								</div>
							</DrawerContent>
						</Drawer>

						<li>
							<Link
								aria-label="Go home"
								className={cn(
									"flex h-11 w-11 items-center justify-center no-underline outline-none ring-offset-background transition-all",

									"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
								)}
								to="/"
							>
								<PuzzlelyIcon className="h-9 w-9" />
							</Link>
						</li>
					</ul>

					<ul className="flex gap-1">
						<Tooltip>
							<li>
								<TooltipTrigger asChild>
									<Button
										className="h-11 w-11"
										disabled={unsaved.length <= 0}
										onClick={async () => {
											if (!me) {
												navigate("/login");
												return;
											}
											if (unsaved.length === 0) {
												return;
											}

											await onSync();
										}}
										size="icon"
										variant="ghost"
									>
										<SaveAllIcon className="h-4 w-4" />
									</Button>
								</TooltipTrigger>
							</li>

							<TooltipContent align="end">
								<p className="text-sm font-medium">
									You have {unsaved.length} unsaved game
									{unsaved.length === 1 ? "" : "s"}!
								</p>

								<small className="text-xs text-muted-foreground">
									Save them now to make sure that your games persists.
								</small>
							</TooltipContent>
						</Tooltip>

						{me ? (
							<li>
								<Form method="delete" action="/logout">
									<Button className="h-11 w-11" size="icon" variant="ghost">
										<LogOutIcon className="h-4 w-4" />
									</Button>
								</Form>
							</li>
						) : (
							<li>
								<Link tabIndex={-1} to="/login/">
									<Button aria-label="Log in" className="h-11 w-11" size="icon" variant="ghost">
										<LogInIcon className="h-4 w-4" />
									</Button>
								</Link>
							</li>
						)}
					</ul>
				</div>
			</header>
		);
	},
);
Header.displayName = "Header";
