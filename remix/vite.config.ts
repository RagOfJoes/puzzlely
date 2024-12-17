/* eslint-disable import/no-extraneous-dependencies */
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import paths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [reactRouter(), paths()],
});
