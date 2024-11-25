import type { PageInfo } from "./page-info";
import type { PuzzleSummaryNode } from "./puzzle-summary-node";

export type PuzzleSummaryConnection = {
	edges: PuzzleSummaryNode[];
	page_info: PageInfo;
};
