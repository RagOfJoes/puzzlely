import { redirect } from "react-router";

import { completePuzzle, getHistory } from "@/lib/history";
import { requireUser } from "@/lib/require-user";
import { API } from "@/services/api.server";
import { history as historyCookie } from "@/services/cookies.server";
import { dataWithError, dataWithSuccess } from "@/services/toast.server";
import type { Game } from "@/types/game";
import { GamePayloadSchema } from "@/types/game-payload";
import type { Response } from "@/types/response";

import type { Route } from "./+types/games.save.$id";

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

		return dataWithError(response, {
			description: payload.error.issues
				.map((issue) => `${issue.path} - ${issue.message}`)
				.join(", "),
			message: "Failed to save!",
		});
	}

	const game = await API.games.save(request, { payload: payload.data, puzzleID: params.id ?? "" });
	if (!game.success) {
		return dataWithError(game, {
			description: game.error.message,
			message: "Failed to save!",
		});
	}

	// Remove from history if completed
	if (game.data.completed_at) {
		const cookie = request.headers.get("Cookie");
		const history = getHistory((await historyCookie.parse(cookie)) ?? {});

		const updated = completePuzzle(game.data, history);

		return dataWithSuccess(
			game,
			{
				message: "Saved!",
			},
			{
				headers: {
					"Set-Cookie": await historyCookie.serialize(updated),
				},
			},
		);
	}

	return dataWithSuccess(game, {
		message: "Saved!",
	});
}
