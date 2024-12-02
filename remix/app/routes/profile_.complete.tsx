import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect, useFetcher, useLoaderData } from "@remix-run/react";
import { LoaderCircleIcon } from "lucide-react";

import { Button } from "@/components/button";
import { Header } from "@/components/header";
import { UserUpdateForm } from "@/components/user-update-form";
import { requireUser } from "@/lib/require-user";
import { getToast, redirectWithToast } from "@/services/toast.server";
import type { UserUpdatePayload } from "@/types/user-update-payload";

export async function loader({ request }: LoaderFunctionArgs) {
	const me = await requireUser(request);
	const { toast } = await getToast(request);

	if (me.state === "COMPLETE") {
		return !toast ? redirect("/profile") : redirectWithToast("/profile", toast);
	}

	return json({
		me,
	});
}

export default function ProfileComplete() {
	const loaderData = useLoaderData<typeof loader>();

	const fetcher = useFetcher<UserUpdatePayload>({
		key: "users.update",
	});

	return (
		<>
			<Header />

			<main className="mx-auto h-[calc(100dvh-var(--header-height))] w-full max-w-screen-md px-5 pb-5">
				<article className="flex h-full w-full flex-col items-center justify-center">
					<div className="flex w-full flex-col items-start gap-1">
						<h1 className="text-2xl font-semibold leading-none">Complete your profile setup</h1>

						<p className="text-sm leading-none text-muted-foreground">
							To start enjoying all the features of Puzzlely!
						</p>
					</div>

					<div className="mt-6 flex w-full flex-col items-start gap-4">
						<UserUpdateForm
							action="/users/update"
							defaultValues={{
								username: loaderData.me.username,
							}}
							fetcher={fetcher}
							id="user-update-form"
							method="PUT"
						/>

						<div className="flex w-full justify-end">
							<Button
								className="gap-2"
								disabled={fetcher.state === "submitting"}
								form="user-update-form"
								size="lg"
								type="submit"
							>
								{fetcher.state === "submitting" && (
									<LoaderCircleIcon className="h-4 w-4 shrink-0 animate-spin" />
								)}

								{fetcher.state === "submitting" ? "Submitting..." : "Complete"}
							</Button>
						</div>
					</div>
				</article>
			</main>
		</>
	);
}
