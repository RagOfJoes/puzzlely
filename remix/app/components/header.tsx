import type { ComponentProps, ElementRef } from "react";
import { forwardRef } from "react";

import { Link } from "@remix-run/react";

import { PuzzlelyIcon } from "@/components/puzzlely-icon";
import { cn } from "@/lib/cn";

export type HeaderProps = Omit<ComponentProps<"header">, "children">;

export const Header = forwardRef<ElementRef<"header">, HeaderProps>((props, ref) => (
	<header
		className={cn(
			"z-[1] mx-auto flex h-[var(--header-height)] w-full max-w-screen-md items-center justify-between p-5",

			props.className,
		)}
		ref={ref}
	>
		<Link
			to="/"
			className={cn(
				"flex items-center rounded-md no-underline outline-none ring-offset-background",

				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
			)}
		>
			<div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted">
				<PuzzlelyIcon className="h-10 w-10" />
			</div>

			<h1 className="font-heading relative ml-3 select-none text-xl font-bold">Puzzlely</h1>
		</Link>
	</header>
));
