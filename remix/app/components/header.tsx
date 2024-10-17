import type { ComponentProps, ElementRef } from "react";
import { forwardRef } from "react";

import { Form, Link } from "@remix-run/react";
import { LogOut, User as UserIcon } from "lucide-react";

import { PuzzlelyIcon } from "@/components/puzzlely-icon";
import { cn } from "@/lib/cn";
import type { User } from "@/types/user";

import { Button } from "./button";

export type HeaderProps = Omit<ComponentProps<"header">, "children"> & {
	me?: User;
};

export const Header = forwardRef<ElementRef<"header">, HeaderProps>(
	({ className, me, ...props }, ref) => (
		<header
			className={cn(
				"z-[1] mx-auto flex h-[var(--header-height)] w-full max-w-screen-md items-center justify-between px-5",

				className,
			)}
			ref={ref}
			{...props}
		>
			<Link
				to="/"
				className={cn(
					"flex items-center no-underline outline-none ring-offset-background transition-all",

					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				)}
			>
				<div className="flex h-11 w-11 items-center justify-center border bg-muted">
					<PuzzlelyIcon className="h-9 w-9" />
				</div>

				<h1 className="font-heading relative ml-3 select-none text-xl font-bold">Puzzlely</h1>
			</Link>

			{me ? (
				<div className="flex gap-1">
					<Link tabIndex={-1} to="/profile">
						<Button className="h-11 w-11" size="icon" variant="outline">
							<UserIcon className="h-4 w-4" />
						</Button>
					</Link>

					<Form method="delete" action="/logout">
						<Button className="h-11 w-11 gap-2" size="icon" variant="outline">
							<LogOut className="h-4 w-4" />
						</Button>
					</Form>
				</div>
			) : (
				<Link tabIndex={-1} to="/login">
					<Button size="lg" variant="outline">
						Log In
					</Button>
				</Link>
			)}
		</header>
	),
);
