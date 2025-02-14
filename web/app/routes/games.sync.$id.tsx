import { data, redirect } from "react-router";

import { requireUser } from "@/lib/require-user";
import { API } from "@/services/api.server";
import type { Game } from "@/types/game";
import { GamePayloadSchema } from "@/types/game-payload";
import type { Response } from "@/types/response";

import type { Route } from "./+types/games.sync.$id";

export async function action({ params, request }: Route.ActionArgs) {
	// Make sure the request is a PUT request
	if (request.method.toUpperCase() !== "PUT") {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw redirect("/", {
			status: 405,
		});
	}

	await requireUser(request);

	const response: Response<Game> = {
		success: false,
		error: {
			code: "Internal",
			message: "",
		},
	};

	const json = await request.json();
	const payload = GamePayloadSchema.safeParse(json);
	if (!payload.success) {
		response.error.message = payload.error.issues
			.map((issue) => `${issue.path} - ${issue.message}`)
			.join(", ");

		return data(response);
	}

	const game = await API.games.save(request, { payload: payload.data, puzzleID: params.id ?? "" });
	return data(game);
}
