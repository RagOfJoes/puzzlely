import type { GameSummaryNode } from "@/types/game-summary-node";
import type { PageInfo } from "@/types/page-info";

export type GameSummaryConnection = {
	edges: GameSummaryNode[];
	page_info: PageInfo;
};
