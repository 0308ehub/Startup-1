export type DeckSection = "MAIN" | "EXTRA" | "SIDE";

export function isDeckLegal({ mainCount, extraCount, sideCount }: { mainCount: number; extraCount: number; sideCount: number }) {
	return mainCount >= 40 && mainCount <= 60 && extraCount <= 15 && sideCount <= 15;
}


