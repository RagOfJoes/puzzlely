import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import { Link } from "react-router";

import { cn } from "@/lib/cn";

export type FooterProps = Omit<ComponentPropsWithoutRef<"footer">, "children">;

export const Footer = forwardRef<ElementRef<"footer">, FooterProps>(
	({ className, ...props }, ref) => (
		<footer
			{...props}
			className={cn(
				"z-[1] mx-auto flex w-full max-w-screen-md items-center justify-between px-5 py-4",

				className,
			)}
			ref={ref}
		>
			<p className="text-sm text-muted-foreground">
				Built by{" "}
				<Link
					className={cn(
						"underline underline-offset-2 ring-offset-background",

						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
					)}
					rel="noreferrer"
					target="_blank"
					to="https://ragofjoes.dev"
				>
					RagOfJoes
				</Link>
				. Source code is available on{" "}
				<Link
					className={cn(
						"underline underline-offset-2 ring-offset-background",

						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
					)}
					rel="noreferrer"
					target="_blank"
					to="https://github.com/RagOfJoes/puzzlely"
				>
					GitHub
				</Link>
				.
			</p>
		</footer>
	),
);
Footer.displayName = "Footer";
