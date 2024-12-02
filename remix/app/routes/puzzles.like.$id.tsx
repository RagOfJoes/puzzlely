import { redirect, type ActionFunctionArgs } from "@remix-run/node";

import { requireUser } from "@/lib/require-user";
import { API } from "@/services/api.server";
import { jsonWithError } from "@/services/toast.server";

export async function action({ params, request }: ActionFunctionArgs) {
	// Make sure the request is a PUT request
	if (request.method.toUpperCase() !== "PUT") {
		return redirect("/");
	}

	await requireUser(request);

	const like = await API.puzzles.toggleLike(request, params.id ?? "");
	if (!like.success) {
		return jsonWithError(
			{},
			{
				description: like.error.message,
				message: "Failed to like puzzle!",
			},
		);
	}

	return like.data;
}
