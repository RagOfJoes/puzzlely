import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import { Form, Link } from "@remix-run/react";
import {
	LogInIcon,
	LogOutIcon,
	MenuIcon,
	PlusIcon,
	TrendingUpIcon,
	UserIcon,
	UserPlusIcon,
} from "lucide-react";

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
import { cn } from "@/lib/cn";
import type { User } from "@/types/user";

export type HeaderProps = Omit<ComponentPropsWithoutRef<typeof Primitive.nav>, "children"> & {
	me?: User;
};

export const Header = forwardRef<ElementRef<typeof Primitive.nav>, HeaderProps>(
	({ className, me, ...props }, ref) => (
		<Primitive.nav
			className={cn(
				"z-[1] mx-auto flex h-[var(--header-height)] w-full max-w-screen-md items-center justify-between px-5",

				className,
			)}
			ref={ref}
			{...props}
		>
			<div className="flex gap-1">
				<Drawer direction="left">
					<DrawerTrigger asChild>
						<Button aria-label="Open menu" className="h-11 w-11" size="icon" variant="ghost">
							<MenuIcon className="h-4 w-4" />
						</Button>
					</DrawerTrigger>

					<DrawerContent>
						<div className="flex w-full overflow-hidden rounded-xl border bg-popover">
							<div className="flex w-full flex-col">
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
									<Link tabIndex={-1} to="/puzzles/create">
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

									<Link tabIndex={-1} to="/popular">
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
											<Link tabIndex={-1} to="/profile">
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
											<Link tabIndex={-1} to="/signup">
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

											<Link tabIndex={-1} to="/login">
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
							</div>
						</div>
					</DrawerContent>
				</Drawer>

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
			</div>

			{me ? (
				<div className="flex gap-1">
					<Form method="delete" action="/logout">
						<Button className="h-11 w-11" size="icon" variant="ghost">
							<LogOutIcon className="h-4 w-4" />
						</Button>
					</Form>
				</div>
			) : (
				<div className="flex gap-1">
					<Link tabIndex={-1} to="/login">
						<Button aria-label="Log in" className="h-11 w-11" size="icon" variant="ghost">
							<LogInIcon className="h-4 w-4" />
						</Button>
					</Link>
				</div>
			)}
		</Primitive.nav>
	),
);
