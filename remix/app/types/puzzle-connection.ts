import type { PageInfo } from "./page-info";
import type { PuzzleNode } from "./puzzle-node";

export type PuzzleConnection = {
	edges: PuzzleNode[];
	page_info: PageInfo;
};
