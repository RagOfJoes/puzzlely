import { redirect, type ActionFunctionArgs } from "@remix-run/node";

import { requireUser } from "@/lib/require-user";
import { GamePayloadSchema } from "@/schemas/game-payload-schema";
import { API } from "@/services/api.server";
import { jsonWithError, jsonWithSuccess } from "@/services/toast.server";

export async function action({ params, request }: ActionFunctionArgs) {
	// Make sure the request is a PUT request
	if (request.method.toUpperCase() !== "PUT") {
		return redirect("/", {
			status: 405,
		});
	}

	await requireUser(request);

	const json = await request.json();
	const payload = GamePayloadSchema.safeParse(json);
	if (!payload.success) {
		return jsonWithError(
			{},
			{
				description: payload.error.issues
					.map((issue) => `${issue.path} - ${issue.message}`)
					.join(", "),
				message: "Failed to save game!",
			},
		);
	}

	const game = await API.games.save(request, { payload: payload.data, puzzleID: params.id ?? "" });
	if (!game.success) {
		return jsonWithError(
			{},
			{
				description: game.error.message,
				message: "Failed to save game!",
			},
		);
	}

	return jsonWithSuccess(game.data, {
		message: "Saved game!",
	});
}
