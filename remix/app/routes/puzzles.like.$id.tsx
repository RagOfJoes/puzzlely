import { redirect, type ActionFunctionArgs } from "@remix-run/node";

import { UNAUTHORIZED_MESSAGE } from "@/lib/constants";
import { requireUser } from "@/lib/require-user";
import { API } from "@/services/api.server";

export async function action({ params, request }: ActionFunctionArgs) {
	// Make sure the request is a PUT request
	if (request.method.toUpperCase() !== "PUT") {
		return redirect("/");
	}

	await requireUser(request);

	const like = await API.puzzles.toggleLike(request, params.id ?? "");
	if (!like.success && like.error === UNAUTHORIZED_MESSAGE) {
		return redirect("/login");
	}

	return like;
}
