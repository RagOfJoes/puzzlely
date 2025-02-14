import { type RouteConfig, index, prefix, route } from "@react-router/dev/routes";

export default [
	// Auth
	// ---

	...prefix("auth", [
		route("discord", "routes/auth/discord.tsx"),
		route("discord/callback", "routes/auth/discord.callback.tsx"),

		route("github", "routes/auth/github.tsx"),
		route("github/callback", "routes/auth/github.callback.tsx"),
	]),
	route("login", "routes/auth/login.tsx"),
	route("logout", "routes/auth/logout.tsx"),
	route("signup", "routes/auth/signup.tsx"),

	// Index route
	// ---

	index("routes/_index.tsx"),

	// Profile routes
	// ---

	...prefix("profile", [
		route("complete", "routes/profile/complete.tsx"),

		route("/", "routes/profile/_index.tsx", [
			route("created", "routes/profile/created.tsx"),
			route("liked", "routes/profile/liked.tsx"),
			route("history", "routes/profile/history.tsx"),
		]),
	]),

	// Puzzles routes
	// ---

	...prefix("puzzles", [
		route("create", "routes/puzzles/create.tsx"),
		route("like/:id", "routes/puzzles/like.$id.tsx"),
		route("play/:id", "routes/puzzles/play.$id.tsx"),
		route("popular", "routes/puzzles/popular.tsx"),
	]),

	// Users routes
	// ---

	...prefix("users/:id", [
		route("/", "routes/users.$id/_index.tsx", [
			route("created", "routes/users.$id/created.tsx"),
			route("liked", "routes/users.$id/liked.tsx"),
			route("history", "routes/users.$id/history.tsx"),
		]),
	]),

	// Action only routes
	// ---

	route("games/save/:id", "routes/games.save.$id.tsx"),
	route("games/sync/:id", "routes/games.sync.$id.tsx"),
] satisfies RouteConfig;
