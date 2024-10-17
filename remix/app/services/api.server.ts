import { SUPPORTED_PROVIDERS } from "@/lib/constants";
import type { GameConnection } from "@/types/game-connection";
import type { PuzzleConnection } from "@/types/puzzle-connection";
import type { Response } from "@/types/response";
import type { Session } from "@/types/session";
import type { User } from "@/types/user";

export class API {
	static URL: string = process.env.API_URL ?? "https://localhost:8080";

	/**
	 * Authenticates the user with the given provider
	 *
	 * Hits the `/auth/:provider` endpoint on the API
	 *
	 * @param request - The incoming request
	 * @param provider - The provider to authenticate with
	 * @returns The cookie from the API and the newly created session
	 */
	static async auth(
		request: Request,
		{ provider, token }: { provider: string; token: string },
	): Promise<{ cookie: string; response: Response<Session> }> {
		if (!SUPPORTED_PROVIDERS.includes(provider)) {
			throw new Error("Provider not supported");
		}

		const res = await fetch(`${process.env.API_URL}/auth/${provider}`, {
			method: "POST",
			credentials: "include",
			headers: {
				Authorization: `Bearer ${token}`,
				Cookie: request.headers.get("cookie") ?? "",
			},
		});

		const response: Response<Session> = await res.json();
		return {
			cookie: res.headers.get("set-cookie") ?? "",
			response,
		};
	}

	/**
	 * Logs the user out
	 *
	 * Hits the `/logout` endpoint on the API
	 *
	 * @param request - The incoming request
	 * @returns Whether the user was successfully logged out
	 */
	static async logout(request: Request): Promise<Response<boolean>> {
		const res = await fetch(`${API.URL}/logout`, {
			credentials: "include",
			headers: {
				Cookie: request.headers.get("cookie") ?? "",
			},
			method: "DELETE",
		});

		const response: Response<boolean> = await res.json();
		return response;
	}

	/**
	 * Retrieves currently authenticated user, if possible
	 *
	 * Hits the `/me` endpoint on the API
	 *
	 * @param request - The incoming request
	 * @returns Currently authenticated user's session
	 */
	static async me(request: Request): Promise<Response<Session>> {
		const res = await fetch(`${API.URL}/me`, {
			credentials: "include",
			headers: {
				Cookie: request.headers.get("cookie") ?? "",
			},
			method: "GET",
		});

		const response: Response<Session> = await res.json();
		return response;
	}

	/**
	 * Game related API calls
	 *
	 * Hits `/games/*` endpoints on the API
	 *
	 */
	static games = {
		prefix: "games",

		async history(
			request: Request,
			{ userID }: { userID: string },
		): Promise<Response<GameConnection>> {
			const res = await fetch(`${API.URL}/${this.prefix}/history/${userID}`, {
				credentials: "include",
				headers: {
					Cookie: request.headers.get("cookie") ?? "",
				},
				method: "GET",
			});

			const response: Response<GameConnection> = await res.json();
			return response;
		},
	};

	/**
	 * Puzzle related API calls
	 *
	 * Hits `/puzzles/*` endpoints on the API
	 */
	static puzzles = {
		prefix: "puzzles",

		/**
		 * Retrieves most popular list of puzzles that the user hasn't played yet. Pass `cursor` as a query parameter to paginate
		 *
		 * Hits the `/puzzles/popular` endpoint on the API
		 *
		 * @param request - The incoming request
		 * @returns A list of the most recent puzzles that the user hasn't played yet
		 */
		async popular(request: Request): Promise<Response<PuzzleConnection>> {
			const cursor = new URL(request.url).searchParams.get("cursor");
			const res = await fetch(`${API.URL}/${this.prefix}/recent?cursor=${cursor ?? ""}`, {
				credentials: "include",
				headers: {
					Cookie: request.headers.get("cookie") ?? "",
				},
				method: "GET",
			});

			const response: Response<PuzzleConnection> = await res.json();
			return response;
		},

		/**
		 * Retrieves most recent list of puzzles that the user hasn't played yet. Pass `cursor` as a query parameter to paginate
		 *
		 * Hits the `/puzzles/recent` endpoint on the API
		 *
		 * @param request - The incoming request
		 * @returns A list of the most recent puzzles that the user hasn't played yet
		 */
		async recent(request: Request): Promise<Response<PuzzleConnection>> {
			const cursor = new URL(request.url).searchParams.get("cursor");
			const res = await fetch(`${API.URL}/${this.prefix}/recent?cursor=${cursor ?? ""}`, {
				credentials: "include",
				headers: {
					Cookie: request.headers.get("cookie") ?? "",
				},
				method: "GET",
			});

			const response: Response<PuzzleConnection> = await res.json();
			return response;
		},
	};

	static users = {
		prefix: "users",

		/**
		 * Retrieves a user by their ID
		 *
		 * Hits the `/users/:id` endpoint on the API
		 *
		 * @param request - The incoming request
		 * @param id - The ID of the user to retrieve
		 * @returns The user with the given ID
		 */
		async get(request: Request, { id }: { id: string }): Promise<Response<User>> {
			const res = await fetch(`${API.URL}/${this.prefix}/${id}`, {
				credentials: "include",
				headers: {
					Cookie: request.headers.get("cookie") ?? "",
				},
				method: "GET",
			});

			const response: Response<User> = await res.json();
			return response;
		},
	};
}
