import { useEffect, useState } from "react";

import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet, useFetcher, useLoaderData, useMatches, useNavigate } from "@remix-run/react";
import dayjs from "dayjs";
import { EditIcon, Heart, History, LoaderCircleIcon, Puzzle } from "lucide-react";
import { toast as notify } from "sonner";

import { Button } from "@/components/button";
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
import { hydrateUser } from "@/lib/hydrate-user";
import { requireUser } from "@/lib/require-user";
import type { action } from "@/routes/users.update";
import { redirectWithInfo } from "@/services/toast.server";

export type ValidTabs = "created" | "liked" | "history";

export async function loader({ request }: LoaderFunctionArgs) {
	const me = await requireUser(request);
	if (me.state === "PENDING") {
		return redirectWithInfo("/profile/complete", {
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
			return redirect("/profile/created");
	}

	return json({ me });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	if (!data) {
		return [
			{
				title: "Profile | Puzzlely",
			},
		];
	}

	return [
		{
			title: `${data.me.username} | Puzzlely`,
		},
	];
};

export default function Profile() {
	const loaderData = useLoaderData<typeof loader>();
	const matches = useMatches();
	const navigate = useNavigate();

	const fetcher = useFetcher<typeof action>({
		key: "users.update",
	});

	const [isOpen, toggleIsOpen] = useState<boolean>(false);
	const [tab, setTab] = useState<ValidTabs>(() => {
		const match = matches[matches.length - 1];
		switch (match?.id) {
			case "routes/profile.history":
				return "history";
			case "routes/profile.liked":
				return "liked";
			default:
				return "created";
		}
	});

	useEffect(() => {
		// eslint-disable-next-line default-case
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
		}
	}, [fetcher.data, fetcher.state, isOpen]);

	return (
		<>
			<Header me={hydrateUser(loaderData.me)} />

			<main className="mx-auto min-h-[calc(100dvh-var(--header-height))] w-full max-w-screen-md px-5 pb-5">
				<article className="flex h-full w-full flex-col gap-1">
					<div className="flex flex-col gap-2 border bg-background px-4 py-4">
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

									<div className="py-4">
										<UserUpdateForm
											action="/users/update"
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
											size="lg"
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

								<p className="font-medium leading-none">
									{dayjs(loaderData.me.created_at).format("MMM DD, YYYY")}
								</p>
							</div>

							<div className="flex w-full flex-col gap-1">
								<p className="text-sm text-muted-foreground">Updated at</p>

								<p className="font-medium leading-none">
									{loaderData.me.updated_at
										? dayjs(loaderData.me.updated_at).format("MMM DD, YYYY")
										: "N/A"}
								</p>
							</div>
						</div>
					</div>

					<Tabs
						onValueChange={(newTab) => {
							if (newTab !== "created" && newTab !== "liked" && newTab !== "history") {
								return;
							}

							setTab(newTab);

							navigate(`/profile/${newTab}/`, {
								preventScrollReset: true,
							});
						}}
						value={tab}
					>
						<TabsList className="w-full">
							<TabsTrigger value="created">
								<Puzzle className="h-4 w-4" />
								Created
							</TabsTrigger>
							<TabsTrigger value="liked">
								<Heart className="h-4 w-4" />
								Liked
							</TabsTrigger>
							<TabsTrigger value="history">
								<History className="h-4 w-4" />
								History
							</TabsTrigger>
						</TabsList>

						<Outlet />
					</Tabs>
				</article>
			</main>
		</>
	);
}
