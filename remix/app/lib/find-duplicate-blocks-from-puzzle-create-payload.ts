import type { PuzzleCreatePayload } from "@/types/puzzle-create-payload";

export function findDuplicateBlocksFromPuzzleCreatePayload(
	payload: PuzzleCreatePayload,
): [number, number][] {
	const fields: [number, number][] = [];

	// Map out all blocks
	const map: { [value: string]: [number, number][] } = {};
	const groups = payload.groups;
	for (let k = 0; k < groups.length; k += 1) {
		const group = groups[k];
		if (!group) {
			// eslint-disable-next-line no-continue
			continue;
		}

		for (let l = 0; l < group.blocks.length; l += 1) {
			const block = group.blocks[l];
			if (!block || !block.value) {
				// eslint-disable-next-line no-continue
				continue;
			}

			const trimmed = block.value.trim();
			if (!map[trimmed]) {
				map[trimmed] = [[k, l]];

				// eslint-disable-next-line no-continue
				continue;
			}

			map[trimmed].push([k, l]);
		}
	}

	// Check for uniqueness
	const keys = Object.keys(map);
	for (let l = 0; l < keys.length; l += 1) {
		const key = keys[l];
		if (!key) {
			// eslint-disable-next-line no-continue
			continue;
		}

		const trimmed = map[key];
		if (!trimmed || trimmed.length === 1) {
			// eslint-disable-next-line no-continue
			continue;
		}

		fields.push(...trimmed);
	}

	return fields;
}
