import { redirect } from "react-router";

import { requireUser } from "@/lib/require-user";
import { API } from "@/services/api.server";
import { dataWithError } from "@/services/toast.server";

import type { Route } from "./+types/like.$id";

export async function action({ params, request }: Route.ActionArgs) {
	// Make sure the request is a PUT request
	if (request.method.toUpperCase() !== "PUT") {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw redirect("/");
	}

	await requireUser(request);

	const like = await API.puzzles.toggleLike(request, params.id ?? "");
	if (!like.success) {
		return dataWithError(like, {
			description: like.error.message,
			message: "Failed to like puzzle!",
		});
	}

	return like;
}
