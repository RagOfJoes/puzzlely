import { LoaderCircleIcon } from "lucide-react";
import { redirect, useFetcher } from "react-router";

import { Button } from "@/components/button";
import { Header } from "@/components/header";
import { UserUpdateForm } from "@/components/user-update-form";
import { requireUser } from "@/lib/require-user";
import type { action } from "@/routes/users.update";

import type { Route } from "./+types/complete";

export async function loader({ request }: Route.LoaderArgs) {
	const me = await requireUser(request);

	if (me.state === "COMPLETE") {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw redirect("/profile");
	}

	return {
		me,
	};
}

export default function Component({ loaderData }: Route.ComponentProps) {
	const fetcher = useFetcher<typeof action>({
		key: "users.update",
	});

	return (
		<>
			<Header me={loaderData.me} />

			<main className="mx-auto h-[calc(100dvh-var(--header-height))] w-full max-w-screen-md px-5 pb-5">
				<article className="flex h-full w-full flex-col items-center justify-center">
					<div className="w-full min-w-0 rounded-xl border bg-card p-6">
						<div className="flex w-full flex-col items-start gap-1.5">
							<h1 className="text-2xl font-semibold leading-none">Complete your profile setup</h1>

							<p className="text-sm text-muted-foreground">
								To start enjoying all the features of Puzzlely!
							</p>
						</div>

						<div className="mt-6 flex w-full flex-col items-start gap-4">
							<UserUpdateForm
								action="/users/update"
								defaultValues={{
									username: fetcher.data?.defaultValues?.username,
								}}
								fetcher={fetcher}
								id="user-update-form"
								method="PUT"
							/>

							<div className="flex w-full justify-end">
								<Button
									className="gap-2"
									disabled={
										(fetcher.state === "loading" && !fetcher.data?.errors) ||
										fetcher.state === "submitting"
									}
									form="user-update-form"
									size="sm"
									type="submit"
								>
									{fetcher.state === "submitting" && (
										<LoaderCircleIcon className="h-4 w-4 shrink-0 animate-spin" />
									)}

									{fetcher.state === "submitting" ? "Submitting..." : "Complete"}
								</Button>
							</div>
						</div>
					</div>
				</article>
			</main>
		</>
	);
}
