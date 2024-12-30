import { type RouteConfig, index, prefix, route } from "@react-router/dev/routes";

export default [
	// Auth
	// ---

	...prefix("auth", [
		route("discord", "routes/auth/discord"),
		route("discord/callback", "routes/auth/discord.callback"),
	]),
	route("login", "routes/auth/login"),
	route("logout", "routes/auth/logout"),
	route("signup", "routes/auth/signup"),

	// Index route
	// ---

	index("routes/_index"),

	// Profile routes
	// ---

	...prefix("profile", [
		route("complete", "routes/profile/complete"),

		route("/", "routes/profile/_index", [
			route("created", "routes/profile/created"),
			route("liked", "routes/profile/liked"),
			route("history", "routes/profile/history"),
		]),
	]),

	// Puzzles routes
	// ---

	...prefix("puzzles", [
		route("create", "routes/puzzles/create"),
		route("like/:id", "routes/puzzles/like.$id"),
		route("play/:id", "routes/puzzles/play.$id"),
	]),

	// Users routes
	// ---

	...prefix("users/:id", [
		route("/", "routes/users.$id/_index", [
			route("created", "routes/users.$id/created"),
			route("liked", "routes/users.$id/liked"),
			route("history", "routes/users.$id/history"),
		]),
	]),

	// Action only routes
	// ---

	route("games/save/:id", "routes/games.save.$id"),
] satisfies RouteConfig;
