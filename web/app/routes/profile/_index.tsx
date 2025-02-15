import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { EditIcon, HistoryIcon, LoaderCircleIcon, PuzzleIcon, StarIcon } from "lucide-react";
import type { FieldErrors } from "react-hook-form";
import { redirect, Outlet, useFetcher, useMatches, Link } from "react-router";
import { getValidatedFormData } from "remix-hook-form";
import { toast as notify } from "sonner";

import { Button } from "@/components/button";
import { DateTime } from "@/components/date-time";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/dialog";
import { Header } from "@/components/header";
import { Tabs, TabsList, TabsTrigger } from "@/components/tabs";
import { UserUpdateForm } from "@/components/user-update-form";
import { cn } from "@/lib/cn";
import { requireUser } from "@/lib/require-user";
import { API } from "@/services/api.server";
import {
	dataWithError,
	dataWithSuccess,
	redirectWithInfo,
	redirectWithSuccess,
} from "@/services/toast.server";
import type { UserUpdatePayload } from "@/types/user-update-payload";
import { UserUpdatePayloadSchema } from "@/types/user-update-payload";

import type { Route } from "./+types/_index";

export type ValidTabs = "created" | "liked" | "history";

export async function action({ request }: Route.ActionArgs) {
	const user = await requireUser(request);

	const {
		data,
		errors,
		receivedValues: defaultValues,
	} = await getValidatedFormData<UserUpdatePayload>(request, zodResolver(UserUpdatePayloadSchema));

	const response: {
		defaultValues?: Partial<UserUpdatePayload>;
		errors?: FieldErrors<UserUpdatePayload>;
	} = {
		defaultValues,
		errors,
	};
	if (errors) {
		return response;
	}

	const updated = await API.users.update(request, data);
	if (!updated.success) {
		response.errors = {
			username: {
				message: updated.error.message,
				type: "custom",
			},
		};

		return dataWithError(response, {
			description: updated.error.message,
			message: "Failed to update profile!",
		});
	}

	// If the user hasn't completed their profile yet, then, it's safe to assume the request came from `/profile/complete`
	//
	// NOTE: Redirect to `/profile/created` to ensure the toast appears
	if (user.state === "PENDING" && !user.updated_at) {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw await redirectWithSuccess("/profile/created", {
			message: "Successfully completed profile!",
		});
	}

	return dataWithSuccess(response, {
		message: "Successfully updated profile!",
	});
}

export async function loader({ request }: Route.LoaderArgs) {
	const me = await requireUser(request);
	if (me.state === "PENDING") {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw await redirectWithInfo("/profile/complete", {
			message: "Please complete your profile setup!",
		});
	}

	const url = new URL(request.url);
	const split = url.pathname.split("/").filter((str) => str.length > 0);
	switch (split[split.length - 1]) {
		case "created":
			break;
		case "liked":
			break;
		case "history":
			break;
		default:
			// eslint-disable-next-line @typescript-eslint/no-throw-literal
			throw redirect("/profile/created/");
	}

	return {
		me,
	};
}

export function meta({ data }: Route.MetaArgs) {
	return [
		{
			title: `${data.me.username} | Puzzlely`,
		},
		{
			name: "description",
			content: "View your created, liked, and played puzzles.",
		},
	];
}

export default function Component({ loaderData }: Route.ComponentProps) {
	const matches = useMatches();

	const fetcher = useFetcher<typeof action>({
		key: "profile.update",
	});

	const [isOpen, toggleIsOpen] = useState<boolean>(false);
	const [tab, setTab] = useState<ValidTabs>(() => {
		const match = matches[matches.length - 1];
		switch (match?.id) {
			case "routes/profile/history":
				return "history";
			case "routes/profile/liked":
				return "liked";
			default:
				return "created";
		}
	});

	useEffect(() => {
		switch (fetcher.state) {
			case "loading":
				if (!fetcher.data) {
					return;
				}

				notify.dismiss("users.update");
				break;
			case "submitting":
				if (!isOpen) {
					return;
				}

				toggleIsOpen(false);
				notify.loading("Updating profile...", {
					id: "users.update",
				});
				break;
			default:
				break;
		}
	}, [fetcher.data, fetcher.state, isOpen]);

	useEffect(() => {
		let newTab: ValidTabs;
		const match = matches[matches.length - 1];
		switch (match?.id) {
			case "routes/profile/history":
				newTab = "history";
				break;
			case "routes/profile/liked":
				newTab = "liked";
				break;
			default:
				newTab = "created";
				break;
		}

		setTab(newTab);
	}, [matches, tab]);

	return (
		<>
			<Header me={loaderData.me} />

			<main className="mx-auto min-h-[calc(100dvh-var(--header-height))] w-full max-w-screen-md px-5 pb-5">
				<div className="flex h-full w-full flex-col gap-1">
					<div className="flex flex-col gap-2 rounded-xl border bg-card px-4 py-4">
						<div className="flex gap-2">
							<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-foreground text-xl font-semibold text-muted">
								{loaderData.me.username[0]}
							</div>

							<Dialog onOpenChange={toggleIsOpen} open={isOpen}>
								<DialogTrigger asChild>
									<Button
										aria-label="Edit profile"
										className={cn(
											"w-full justify-start gap-2 overflow-hidden p-0 text-xl font-medium",

											"hover:bg-transparent",
										)}
										size="lg"
										variant="ghost"
									>
										<span className="truncate">{loaderData.me.username}</span>

										<EditIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
									</Button>
								</DialogTrigger>

								<DialogContent>
									<DialogHeader>
										<DialogTitle>Edit Profile</DialogTitle>
										<DialogDescription>
											Express yourself by updating your profile.
										</DialogDescription>
									</DialogHeader>

									<div className="bg-popover p-4 text-popover-foreground">
										<UserUpdateForm
											action="/profile/"
											defaultValues={{
												username: loaderData.me.username,
											}}
											fetcher={fetcher}
											id="user-update-form"
											method="PUT"
										/>
									</div>

									<DialogFooter>
										<Button
											className="gap-2"
											disabled={fetcher.state === "submitting"}
											form="user-update-form"
											size="sm"
											type="submit"
										>
											{fetcher.state === "submitting" && (
												<LoaderCircleIcon className="fill-tex h-4 w-4 shrink-0 animate-spin" />
											)}

											{fetcher.state === "submitting" ? "Submitting..." : "Submit"}
										</Button>
									</DialogFooter>

									<DialogClose />
								</DialogContent>
							</Dialog>
						</div>

						<div className="flex w-full items-center gap-1">
							<div className="flex w-full flex-col gap-1">
								<p className="text-sm text-muted-foreground">Joined</p>

								<DateTime
									className="font-medium leading-none"
									dateTime={loaderData.me.created_at}
									format="MMM DD, YYYY"
								/>
							</div>

							<div className="flex w-full flex-col gap-1">
								<p className="text-sm text-muted-foreground">Updated at</p>

								{loaderData.me.updated_at ? (
									<DateTime
										className="font-medium leading-none"
										dateTime={loaderData.me.updated_at}
										format="MMM DD, YYYY"
									/>
								) : (
									<p className="font-medium leading-none">N/A</p>
								)}
							</div>
						</div>
					</div>

					<Tabs value={tab}>
						<TabsList className="w-full">
							<TabsTrigger asChild value="created">
								<Link to="/profile/created/">
									<PuzzleIcon className="h-4 w-4" />
									Created
								</Link>
							</TabsTrigger>
							<TabsTrigger asChild value="liked">
								<Link to="/profile/liked/">
									<StarIcon className="h-4 w-4" />
									Liked
								</Link>
							</TabsTrigger>
							<TabsTrigger asChild value="history">
								<Link to="/profile/history/">
									<HistoryIcon className="h-4 w-4" />
									History
								</Link>
							</TabsTrigger>
						</TabsList>

						<Outlet />
					</Tabs>
				</div>
			</main>
		</>
	);
}
