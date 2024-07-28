/* eslint-disable import/no-extraneous-dependencies */
import { resolve } from "path";

import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import paths from "vite-tsconfig-paths";

installGlobals();

export default defineConfig({
	plugins: [
		remix({
			ignoredRouteFiles: ["**/*.css"],
		}),
		paths(),
	],

	resolve: {
		alias: {
			find: "@",
			replacement: resolve(__dirname, "app"),
		},
	},
});
