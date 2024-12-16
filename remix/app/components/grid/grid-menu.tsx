import type { ElementRef } from "react";
import { forwardRef, useMemo, useState } from "react";

import * as Portal from "@radix-ui/react-portal";
import { Primitive } from "@radix-ui/react-primitive";
import { useFetcher } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRightIcon, StarIcon } from "lucide-react";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/accordion";
import { Button } from "@/components/button";
import { ScrollArea } from "@/components/scroll-area";
import type { UseGame } from "@/hooks/use-game";
import { abbreviateNumber } from "@/lib/abbreviate-number";
import { arePuzzleBlocksSameGroup } from "@/lib/are-puzzle-blocks-same-group";
import { cn } from "@/lib/cn";
import { getPuzzleBlocksFromAttempts } from "@/lib/get-puzzle-blocks-from-attempts";
import { omit } from "@/lib/omit";
import type { PuzzleBlock } from "@/types/puzzle";
import type { PuzzleLike } from "@/types/puzzle-like";
import type { Response } from "@/types/response";

export type GridMenuProps = Portal.PortalProps & {
	game: UseGame[0]["game"];
	puzzle: UseGame[0]["puzzle"];
	isSuccess: boolean;
};

export const GridMenu = forwardRef<ElementRef<"div">, GridMenuProps>(
	({ game, isSuccess, puzzle, ...props }, ref) => {
		const fetcher = useFetcher<Response<PuzzleLike>>({
			key: `puzzles.like.${puzzle.id}`,
		});

		const [isHidden, toggleIsHidden] = useState(false);

		const attempts = useMemo<{ blocks: PuzzleBlock[]; isCorrect: boolean }[]>(() => {
			const joined = getPuzzleBlocksFromAttempts(game, puzzle);

			return joined.map((attempt) => ({
				blocks: attempt,
				isCorrect: arePuzzleBlocksSameGroup(attempt),
			}));
		}, [game, puzzle]);

		return (
			<Portal.Root {...omit(props, ["children", "className"])} ref={ref}>
				<Primitive.div className="absolute top-0 flex h-full w-full items-center justify-center">
					<AnimatePresence>
						{isHidden && (
							<Button
								asChild
								className="absolute bottom-4 left-4 z-10 uppercase"
								onClick={() => toggleIsHidden(false)}
								size="icon"
							>
								<motion.button
									animate="animate"
									exit="exit"
									initial="initial"
									variants={{
										animate: {
											opacity: 1,
											transition: {
												duration: 0.12,
											},
											scale: 1,
										},
										exit: {
											opacity: 0,
											transition: {
												duration: 0.12,
											},
											scale: 0.6,
										},
										initial: {
											opacity: 0,
											scale: 0.8,
										},
									}}
								>
									<ArrowUpRightIcon className="h-4 w-4" />
								</motion.button>
							</Button>
						)}

						{!isHidden && (
							<>
								<motion.div
									animate="animate"
									className={cn(
										"z-10 flex max-h-[90%] w-[90%] max-w-sm flex-col overflow-hidden rounded-xl border bg-background outline-none",

										"focus-visible:ring",
									)}
									exit="exit"
									initial="initial"
									ref={ref}
									variants={{
										animate: {
											opacity: 1,
											scale: 1,
											transition: {
												duration: 0.2,
											},
										},
										exit: {
											opacity: 0,
											scale: 0.8,
											transition: {
												duration: 0.2,
											},
										},
										initial: {
											opacity: 0,
											scale: 0.8,
										},
									}}
								>
									<div className="shrink-0 border-b px-4 pb-5 pt-4">
										<div className="flex w-full items-center justify-between">
											<p className="text-sm text-muted-foreground">Score: {game.score}</p>

											<fetcher.Form action={`/puzzles/like/${puzzle.id}`} method="PUT">
												<Button
													aria-label={puzzle.liked_at ? "Unlike puzzle" : "Like puzzle"}
													className={cn(
														"min-w-0 shrink-0 gap-2 text-muted-foreground",

														"[&>svg]:data-[is-liked=true]:fill-current",
													)}
													data-is-liked={!!puzzle.liked_at}
													disabled={fetcher.state === "submitting"}
													size="sm"
													variant="outline"
												>
													<StarIcon className="h-4 w-4" />

													<span>{puzzle.liked_at ? "Liked" : "Like"}</span>

													<hr className="h-full w-[1px] bg-border" />

													<span>{abbreviateNumber(puzzle.num_of_likes)}</span>
												</Button>
											</fetcher.Form>
										</div>

										<h1 className="mt-2 line-clamp-1 text-ellipsis text-lg font-medium leading-none">
											{isSuccess ? "Congratulations!" : "Game Over!"}
										</h1>

										<p className="line-clamp-1 w-full text-ellipsis text-sm text-muted-foreground">
											{isSuccess
												? "You have successfully completed the puzzle!"
												: "You have run out of attempts."}
										</p>
									</div>

									<ScrollArea
										// NOTE: table-fixed prevents Accordion from overflowing horizontally
										className="flex flex-col items-center bg-popover p-4 [&>div>div]:w-full [&>div>div]:table-fixed"
										scrollHideDelay={600}
										type="scroll"
									>
										<Accordion className="min-w-0" defaultValue={["attempts"]} type="multiple">
											<AccordionItem className="w-full border-b-0" value="attempts">
												<AccordionTrigger
													className={cn(
														"w-full",

														"hover:no-underline",
													)}
												>
													<div className="text-sm">
														Attempts{" "}
														<span className="text-muted-foreground">({game.attempts.length})</span>
													</div>
												</AccordionTrigger>

												<AccordionContent>
													<div className="flex w-full flex-col items-center justify-center gap-2">
														{attempts.map((attempt, index) => (
															<div
																className={cn(
																	"group/attempt w-full border border-destructive-foreground bg-destructive p-2",

																	"data-[is-correct='true']:border-success data-[is-correct='true']:bg-success",
																)}
																data-is-correct={attempt.isCorrect}
																key={`${attempt.blocks.map((block) => block.id).join("")}__${index}`}
															>
																<div className="flex w-full items-center">
																	{attempt.blocks.map((block) => (
																		<p
																			className={cn(
																				"w-full basis-1/4 select-none truncate px-2 text-center text-sm font-medium text-destructive-foreground",

																				"[&:not(:last-child)]:border-r [&:not(:last-child)]:border-r-destructive-foreground",
																				"group-data-[is-correct='true']/attempt:text-success-foreground",
																				"group-data-[is-correct='true']/attempt:[&:not(:last-child)]:border-r-success-foreground",
																			)}
																			key={block.id}
																		>
																			{block.value}
																		</p>
																	))}
																</div>
															</div>
														))}
													</div>
												</AccordionContent>
											</AccordionItem>
										</Accordion>
									</ScrollArea>

									<div className="shrink-0 border-t p-4">
										<Button
											className="w-full uppercase"
											onClick={() => toggleIsHidden(true)}
											size="sm"
										>
											Hide
										</Button>
									</div>
								</motion.div>

								<div className="absolute top-0 h-full w-full" />
							</>
						)}
					</AnimatePresence>
				</Primitive.div>
			</Portal.Root>
		);
	},
);
GridMenu.displayName = "GridMenu";
