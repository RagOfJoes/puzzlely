import { Fragment } from "react";

import { useFormContext } from "react-hook-form";

import { Button } from "@/components/button";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/drawer";
import {
	FormControl,
	FormControlError,
	FormControlHelper,
	FormControlLabel,
} from "@/components/form-control";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { cn } from "@/lib/cn";
import { findDuplicateBlocksFromPuzzleCreatePayload } from "@/lib/find-duplicate-blocks-from-puzzle-create-payload";
import { omit } from "@/lib/omit";
import type { PuzzleCreatePayload } from "@/types/puzzle-create-payload";

export function PuzzleCreateFormGroups() {
	const form = useFormContext<PuzzleCreatePayload>();

	return (
		<div className="relative h-full">
			<div
				className={cn(
					"relative grid h-full w-full grid-cols-4 grid-rows-4 gap-1",

					'before:col-start-1 before:col-end-1 before:row-start-1 before:row-end-1 before:w-0 before:content-[""]',
				)}
			>
				{Array.from({ length: 4 }).map((_, i) => (
					<Fragment key={`PuzzleCreateForm-group-${i}`}>
						{Array.from({ length: 4 }).map((__, j) => (
							<Drawer
								direction="right"
								key={`PuzzleCreateForm-group-${i}-block-${j}`}
								onOpenChange={async (isOpen) => {
									if (isOpen) {
										return;
									}

									// Reset errors for group blocks
									for (let k = 0; k < 4; k += 1) {
										form.clearErrors([
											`groups.${k}.blocks.0.value`,
											`groups.${k}.blocks.1.value`,
											`groups.${k}.blocks.2.value`,
											`groups.${k}.blocks.3.value`,
										]);
									}

									// Trigger validation for groups and blocks
									await form.trigger([
										`groups.${i}.description`,
										`groups.${i}.blocks.0.value`,
										`groups.${i}.blocks.1.value`,
										`groups.${i}.blocks.2.value`,
										`groups.${i}.blocks.3.value`,
									]);

									const duplicates = findDuplicateBlocksFromPuzzleCreatePayload(form.getValues());
									// console.log(duplicates);
									if (duplicates.length <= 1) {
										return;
									}

									for (let k = 0; k < duplicates.length; k += 1) {
										const duplicate = duplicates[k];
										if (!duplicate) {
											// eslint-disable-next-line no-continue
											continue;
										}

										form.setError(`groups.${duplicate[0]}.blocks.${duplicate[1]}.value`, {
											message: "Must be unique!",
											type: "custom",
										});
									}
								}}
							>
								<DrawerTrigger asChild>
									<Button
										className={cn(
											"relative col-span-1 row-span-1 inline-flex h-full w-full appearance-none items-center justify-center rounded-xl border bg-card p-2 text-sm font-medium outline-none ring-offset-background transition-[background-color,box-shadow,color]",

											"data-[invalid=true]:border-destructive data-[invalid=true]:bg-destructive data-[invalid=true]:text-destructive-foreground",
											"first-of-type:col-start-1 first-of-type:col-end-1 first-of-type:row-start-1 first-of-type:row-end-1",
											"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
										)}
										data-invalid={
											!!form.formState.errors.groups?.[i]?.description ||
											!!form.formState.errors.groups?.[i]?.blocks?.[j]?.value
										}
										variant="ghost"
									>
										{form.watch().groups[i]?.blocks?.[j]?.value}
									</Button>
								</DrawerTrigger>

								<DrawerContent>
									<div className="flex w-full overflow-hidden rounded-xl border bg-popover">
										<div className="w-full">
											<DrawerHeader className="w-full">
												<DrawerTitle>Update group {i + 1}</DrawerTitle>
												<DrawerDescription>Set description and/or blocks.</DrawerDescription>
											</DrawerHeader>

											<div className="flex flex-col gap-1 p-4">
												<FormControl
													className="w-full"
													invalid={!!form.formState.errors.groups?.[i]?.description?.message}
													required
												>
													<FormControlLabel>Description</FormControlLabel>

													<Textarea
														{...form.register(`groups.${i}.description`)}
														className="bg-popover"
														placeholder="..."
													/>

													<FormControlError>
														{form.formState.errors.groups?.[i]?.description?.message}
													</FormControlError>
													<FormControlHelper>
														Description of how the blocks are connected.
													</FormControlHelper>
												</FormControl>

												{Array.from({ length: 4 }).map((___, k) => (
													<FormControl
														invalid={!!form.formState.errors.groups?.[i]?.blocks?.[k]?.value}
														key={`PuzzleCreateForm-group-${i}-block-${k}-input`}
														required
													>
														<FormControlLabel>Block {k + 1}</FormControlLabel>

														<Input
															{...omit(form.register(`groups.${i}.blocks.${k}.value`), ["onBlur"])}
															className="bg-popover"
															onBlur={(e) => {
																form.setValue(
																	`groups.${i}.blocks.${k}.value`,
																	e.target.value.trim(),
																);
															}}
															placeholder="..."
														/>

														<FormControlError>
															{form.formState.errors.groups?.[i]?.blocks?.[k]?.value?.message}
														</FormControlError>
													</FormControl>
												))}
											</div>
										</div>
									</div>
								</DrawerContent>
							</Drawer>
						))}
					</Fragment>
				))}
			</div>
		</div>
	);
}
