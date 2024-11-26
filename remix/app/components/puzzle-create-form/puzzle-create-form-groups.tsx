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

									// Trigger validation for groups and blocks
									await form.trigger([
										`groups.${i}.description`,
										`groups.${i}.blocks.0.value`,
										`groups.${i}.blocks.1.value`,
										`groups.${i}.blocks.2.value`,
										`groups.${i}.blocks.3.value`,
									]);

									// Map out all blocks
									const map: { [value: string]: [number, number][] } = {};
									const groups = form.getValues("groups");
									for (let k = 0; k < groups.length; k += 1) {
										const group = groups[k];
										if (!group) {
											// eslint-disable-next-line no-continue
											continue;
										}

										for (let l = 0; l < group.blocks.length; l += 1) {
											const block = group.blocks[l];
											if (!block || !block.value) {
												// eslint-disable-next-line no-continue
												continue;
											}

											const trimmed = block.value.trim();
											if (!map[trimmed]) {
												map[trimmed] = [[k, l]];

												// eslint-disable-next-line no-continue
												continue;
											}

											map[trimmed].push([k, l]);
										}
									}

									// Check for uniqueness
									const keys = Object.keys(map);
									for (let l = 0; l < keys.length; l += 1) {
										const key = keys[l];
										if (!key) {
											// eslint-disable-next-line no-continue
											continue;
										}
										const trimmed = map[key];
										if (!trimmed) {
											// eslint-disable-next-line no-continue
											continue;
										}

										if (trimmed.length === 1) {
											if (
												form.formState.errors.groups?.[trimmed[0]![0]]?.blocks?.[trimmed[0]![1]]
													?.value
											) {
												form.clearErrors(`groups.${trimmed[0]![0]}.blocks.${trimmed[0]![1]}.value`);
											}

											// eslint-disable-next-line no-continue
											continue;
										}

										for (let m = 0; m < trimmed.length; m += 1) {
											const element = trimmed[m];
											if (!element) {
												// eslint-disable-next-line no-continue
												continue;
											}

											form.setError(`groups.${element[0]}.blocks.${element[1]}.value`, {
												type: "custom",
												message: "Must be unique!",
											});
										}
									}
								}}
							>
								<DrawerTrigger asChild>
									<Button
										className={cn(
											"relative col-span-1 row-span-1 inline-flex h-full w-full appearance-none items-center justify-center border bg-muted p-2 text-sm font-medium outline-none ring-offset-background transition-[background-color,box-shadow,color]",

											"data-[invalid=true]:border-destructive data-[invalid=true]:bg-destructive data-[invalid=true]:text-destructive-foreground",
											"first-of-type:col-start-1 first-of-type:col-end-1 first-of-type:row-start-1 first-of-type:row-end-1",
											"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
										)}
										data-invalid={
											!!form.formState.errors.groups?.[i]?.description ||
											!!form.formState.errors.groups?.[i]?.blocks?.[j]?.value
										}
										variant="outline"
									>
										{form.watch().groups[i]?.blocks?.[j]?.value}
									</Button>
								</DrawerTrigger>

								<DrawerContent>
									<div className="flex w-full border bg-muted">
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
														autoFocus
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
