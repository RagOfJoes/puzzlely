import type { PageInfo } from "@/types/page-info";
import type { PuzzleNode } from "@/types/puzzle-node";

export type PuzzleConnection = {
	edges: PuzzleNode[];
	page_info: PageInfo;
};
