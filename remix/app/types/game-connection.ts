import type { GameNode } from "./game-node";
import type { PageInfo } from "./page-info";

export type GameConnection = {
	edges: GameNode[];
	page_info: PageInfo;
};
