import { SUPPORTED_PROVIDERS } from "@/lib/constants";
import { getSession } from "@/services/session.server";
import type { Game } from "@/types/game";
import type { GamePayload } from "@/types/game-payload";
import type { GameSummaryConnection } from "@/types/game-summary-connection";
import type { Puzzle } from "@/types/puzzle";
import type { PuzzleConnection } from "@/types/puzzle-connection";
import type { PuzzleCreatePayload } from "@/types/puzzle-create-payload";
import type { PuzzleLike } from "@/types/puzzle-like";
import type { PuzzleSummaryConnection } from "@/types/puzzle-summary-connection";
import type { Response } from "@/types/response";
import type { Session } from "@/types/session";
import type { User } from "@/types/user";
import type { UserUpdatePayload } from "@/types/user-update-payload";

/**
 * Wrapper class for the API
 */
export class API {
	static URL: string = process.env.API_URL ?? "https://localhost:8080";

	/**
	 * Authenticates the user with the given provider
	 *
	 * Hits the `/auth/:provider` endpoint on the API
	 *
	 * @param request - The incoming request
	 * @param provider - The provider to authenticate with
	 * @param token - The access token for the given provider
	 * @returns The cookie from the API and the newly created session
	 */
	static async auth(
		_: Request,
		{ provider, token }: { provider: string; token: string },
	): Promise<Response<Session>> {
		if (!SUPPORTED_PROVIDERS.includes(provider)) {
			throw new Error("Provider not supported");
		}

		const res = await fetch(`${API.URL}/auth/${provider}`, {
			credentials: "include",
			headers: {
				Authorization: `Bearer ${token}`,
			},
			method: "POST",
		});

		const response: Response<Session> = await res.json();
		return response;
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
		const session = await getSession(request.headers.get("Cookie"));

		const res = await fetch(`${API.URL}/logout`, {
			credentials: "include",
			headers: {
				Authorization: `Bearer ${session.get("id") ?? ""}`,
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
		const session = await getSession(request.headers.get("Cookie"));

		const res = await fetch(`${API.URL}/me`, {
			credentials: "include",
			headers: {
				Authorization: `Bearer ${session.get("id") ?? ""}`,
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

		/**
		 * Attempts to retrieve a game for the given puzzle
		 *
		 * Hits the `/games/:id` endpoint on the API
		 *
		 * @param request - The incoming request
		 * @param id - The ID of the puzzle
		 * @returns The game, if any, that the user has played for the given puzzle
		 */
		async get(request: Request, id: string): Promise<Response<Game>> {
			const session = await getSession(request.headers.get("Cookie"));

			const res = await fetch(`${API.URL}/${this.prefix}/${id}`, {
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${session.get("id") ?? ""}`,
				},
				method: "GET",
			});

			const response: Response<Game> = await res.json();
			return response;
		},

		/**
		 * Retrieves user's played puzzles
		 *
		 * Hits the `/games/history/:id` endpoint on the API
		 *
		 * @param request - The incoming request
		 * @param id - The ID of the puzzle
		 * @returns A list of the user's created puzzles
		 */
		async history(request: Request, id: string): Promise<Response<GameSummaryConnection>> {
			const session = await getSession(request.headers.get("Cookie"));

			const cursor = new URL(request.url).searchParams.get("cursor");
			const res = await fetch(`${API.URL}/${this.prefix}/history/${id}?cursor=${cursor ?? ""}`, {
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${session.get("id") ?? ""}`,
				},
				method: "GET",
			});

			const response: Response<GameSummaryConnection> = await res.json();
			return response;
		},

		/**
		 * Saves the given game
		 *
		 * Hits the `/games/:id` endpoint on the API
		 *
		 * @param request - The incoming request
		 * @param payload - The game that the user is attempting to save
		 * @param puzzleID - The puzzle that the game is for
		 * @returns Saved game
		 */
		async save(
			request: Request,
			{ payload, puzzleID }: { payload: GamePayload; puzzleID: string },
		): Promise<Response<Game>> {
			const session = await getSession(request.headers.get("Cookie"));

			const res = await fetch(`${API.URL}/${this.prefix}/${puzzleID}`, {
				body: JSON.stringify(payload),
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${session.get("id") ?? ""}`,
				},
				method: "PUT",
			});

			const response: Response<Game> = await res.json();
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
		 * Creates a new puzzle
		 *
		 * Hits the `/puzzles/create` endpoint on the API
		 *
		 * @param request - The incoming request
		 * @param payload - The puzzle that the user is attempting to create
		 * @returns The newly created puzzle
		 */
		async create(request: Request, payload: PuzzleCreatePayload): Promise<Response<Puzzle>> {
			const session = await getSession(request.headers.get("Cookie"));

			const res = await fetch(`${API.URL}/${this.prefix}/create`, {
				body: JSON.stringify(payload),
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${session.get("id") ?? ""}`,
				},
				method: "POST",
			});

			const response: Response<Puzzle> = await res.json();
			return response;
		},

		/**
		 * Retrieves user's created puzzles
		 *
		 * Hits the `/puzzles/created:id` endpoint on the API
		 *
		 * @param request - The incoming request
		 * @param id - The ID of the puzzle
		 * @returns A list of the user's created puzzles
		 */
		async created(request: Request, id: string): Promise<Response<PuzzleSummaryConnection>> {
			const session = await getSession(request.headers.get("Cookie"));

			const cursor = new URL(request.url).searchParams.get("cursor");
			const res = await fetch(`${API.URL}/${this.prefix}/created/${id}?cursor=${cursor ?? ""}`, {
				credentials: "include",
				headers: {
					Authorization: `Bearer ${session.get("id") ?? ""}`,
				},
				method: "GET",
			});

			const response: Response<PuzzleSummaryConnection> = await res.json();
			return response;
		},

		/**
		 * Retrieves puzzle with the given id
		 *
		 * Hits the `/puzzles/:id` endpoint on the API
		 *
		 * @param request - The incoming request
		 * @param id - The ID of the puzzle
		 * @returns Puzzle
		 */
		async get(request: Request, id: string): Promise<Response<Puzzle>> {
			const session = await getSession(request.headers.get("Cookie"));

			const res = await fetch(`${API.URL}/${this.prefix}/${id}`, {
				credentials: "include",
				headers: {
					Authorization: `Bearer ${session.get("id") ?? ""}`,
				},
				method: "GET",
			});

			const response: Response<Puzzle> = await res.json();
			return response;
		},

		/**
		 * Retrieves user's liked puzzles
		 *
		 * Hits the `/puzzles/liked:id` endpoint on the API
		 *
		 * @param request - The incoming request
		 * @param id - The ID of the user
		 * @returns A list of the user's liked puzzles
		 */
		async liked(request: Request, id: string): Promise<Response<PuzzleSummaryConnection>> {
			const session = await getSession(request.headers.get("Cookie"));

			const cursor = new URL(request.url).searchParams.get("cursor");
			const res = await fetch(`${API.URL}/${this.prefix}/liked/${id}?cursor=${cursor ?? ""}`, {
				credentials: "include",
				headers: {
					Authorization: `Bearer ${session.get("id") ?? ""}`,
				},
				method: "GET",
			});

			const response: Response<PuzzleSummaryConnection> = await res.json();
			return response;
		},

		/**
		 * Retrieves most popular list of puzzles that the user hasn't played yet. Pass `cursor` as a query parameter to paginate
		 *
		 * Hits the `/puzzles/popular` endpoint on the API
		 *
		 * @param request - The incoming request
		 * @returns A list of the most recent puzzles that the user hasn't played yet
		 */
		async popular(request: Request): Promise<Response<PuzzleConnection>> {
			const session = await getSession(request.headers.get("Cookie"));

			const cursor = new URL(request.url).searchParams.get("cursor");
			const res = await fetch(`${API.URL}/${this.prefix}/popular?cursor=${cursor ?? ""}`, {
				credentials: "include",
				headers: {
					Authorization: `Bearer ${session.get("id") ?? ""}`,
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
			const session = await getSession(request.headers.get("Cookie"));

			const url = new URL(request.url);

			const cursor = url.searchParams.get("cursor");
			const direction = url.searchParams.get("direction");
			const res = await fetch(
				`${API.URL}/${this.prefix}/recent?cursor=${cursor ?? ""}&direction=${direction ?? "F"}`,
				{
					credentials: "include",
					headers: {
						Authorization: `Bearer ${session.get("id") ?? ""}`,
					},
					method: "GET",
				},
			);

			const response: Response<PuzzleConnection> = await res.json();
			return response;
		},

		/**
		 * Toggle like on puzzle
		 *
		 * Hits the `/puzzles/like/:id` endpoint on the API
		 *
		 * @param request - The incoming request
		 * @param id - The ID of the puzzle
		 * @returns The newly created puzzle
		 */
		async toggleLike(request: Request, id: string): Promise<Response<PuzzleLike>> {
			const session = await getSession(request.headers.get("Cookie"));

			const res = await fetch(`${API.URL}/${this.prefix}/like/${id}`, {
				credentials: "include",
				headers: {
					Authorization: `Bearer ${session.get("id") ?? ""}`,
				},
				method: "PUT",
			});

			const response: Response<PuzzleLike> = await res.json();
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
		async get(request: Request, id: string): Promise<Response<User>> {
			const session = await getSession(request.headers.get("Cookie"));

			const res = await fetch(`${API.URL}/${this.prefix}/${id}`, {
				credentials: "include",
				headers: {
					Authorization: `Bearer ${session.get("id") ?? ""}`,
				},
				method: "GET",
			});

			const response: Response<User> = await res.json();
			return response;
		},

		/**
		 * Update User
		 *
		 * Hits the `/users/:id` endpoint on the API
		 *
		 * @param request - The incoming request
		 * @param payload - The updates that the user is making
		 * @returns The newly updated user
		 */
		async update(request: Request, payload: UserUpdatePayload): Promise<Response<User>> {
			const session = await getSession(request.headers.get("Cookie"));

			const res = await fetch(`${API.URL}/${this.prefix}`, {
				body: JSON.stringify(payload),
				credentials: "include",
				headers: {
					Authorization: `Bearer ${session.get("id") ?? ""}`,
				},
				method: "PUT",
			});

			const response: Response<User> = await res.json();
			return response;
		},
	};
}
