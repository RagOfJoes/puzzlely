import type { GameSummaryNode } from "./game-summary-node";
import type { PageInfo } from "./page-info";

export type GameSummaryConnection = {
	edges: GameSummaryNode[];
	page_info: PageInfo;
};
