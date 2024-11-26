import { Controller, useFormContext } from "react-hook-form";

import {
	FormControl,
	FormControlError,
	FormControlHelper,
	FormControlLabel,
} from "@/components/form-control";
import { Input } from "@/components/input";
import { Select, SelectList, SelectListItem, SelectTrigger } from "@/components/select";
import { cn } from "@/lib/cn";
import { omit } from "@/lib/omit";
import type { PuzzleCreatePayload } from "@/types/puzzle-create-payload";

export function PuzzleCreateFormMeta() {
	const form = useFormContext<PuzzleCreatePayload>();

	return (
		<div
			className={cn(
				"flex w-full gap-1",

				"max-md:flex-wrap",
			)}
		>
			<FormControl
				className={cn(
					"w-full basis-1/2",

					"max-md:basis-full",
				)}
				invalid={!!form.formState.errors.difficulty?.message}
				required
			>
				<FormControlLabel>Difficulty</FormControlLabel>

				<Controller
					control={form.control}
					name="difficulty"
					render={({ field }) => (
						<Select
							{...omit(field, ["onBlur", "onChange"])}
							onOpenChange={(isOpen) => {
								if (isOpen) {
									return;
								}

								field.onBlur();
							}}
							onValueChange={field.onChange}
						>
							<SelectTrigger
								aria-label="Update difficulty"
								className="w-full justify-between"
								placeholder="Easy, Medium, Hard"
								onBlur={field.onBlur}
							/>

							<SelectList>
								<SelectListItem value="EASY">Easy</SelectListItem>
								<SelectListItem value="MEDIUM">Medium</SelectListItem>
								<SelectListItem value="HARD">Hard</SelectListItem>
							</SelectList>
						</Select>
					)}
				/>

				<FormControlError>{form.formState.errors.difficulty?.message}</FormControlError>
				<FormControlHelper>Use max attempts and the blocks you've created</FormControlHelper>
			</FormControl>

			<FormControl
				className={cn(
					"w-full basis-1/2",

					"max-md:basis-full",
				)}
				invalid={!!form.formState.errors.max_attempts?.message}
				required
			>
				<FormControlLabel>Max Attempts</FormControlLabel>

				<Input
					{...form.register("max_attempts")}
					max={999}
					min={1}
					placeholder="..."
					type="number"
				/>

				<FormControlError>{form.formState.errors.max_attempts?.message}</FormControlError>
				<FormControlHelper>A good starting point for a Medium puzzle is 6</FormControlHelper>
			</FormControl>
		</div>
	);
}
