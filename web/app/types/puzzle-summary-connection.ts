import type { PageInfo } from "@/types/page-info";
import type { PuzzleSummaryNode } from "@/types/puzzle-summary-node";

export type PuzzleSummaryConnection = {
	edges: PuzzleSummaryNode[];
	page_info: PageInfo;
};
