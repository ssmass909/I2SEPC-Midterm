import { ICard } from "./types";

export const RETIRED_BUCKET = 5;

export function toBucketSets(bucketMap: Map<string, number>, retiredBucketNum: number): Array<Set<string>> {
  const buckets: Array<Set<string>> = Array.from({ length: retiredBucketNum + 1 }, () => new Set());
  for (const [cardId, bucketNum] of bucketMap.entries()) {
    if (bucketNum >= 0 && bucketNum <= retiredBucketNum) {
      buckets[bucketNum].add(cardId);
    }
  }
  return buckets;
}

export function getBucketRange(bucketMap: Map<string, number>): [number, number] {
  let min = Infinity,
    max = -Infinity;
  for (const bucketNum of bucketMap.values()) {
    if (bucketNum < min) min = bucketNum;
    if (bucketNum > max) max = bucketNum;
  }
  return [min === Infinity ? 0 : min, max === -Infinity ? 0 : max];
}

export function practice(bucketMap: Map<string, number>, retiredBucketNum: number, day: number): Set<string> {
  const result = new Set<string>();
  for (const [cardId, bucketNum] of bucketMap.entries()) {
    if (bucketNum >= 0 && bucketNum < retiredBucketNum) {
      if (day % (1 << bucketNum) === 0) {
        result.add(cardId);
      }
    }
  }
  return result;
}

export function update(
  bucketMap: Map<string, number>,
  cardId: string,
  retiredBucketNum: number,
  result: "wrong" | "hard" | "easy"
) {
  const current = bucketMap.get(cardId) ?? 0;
  let next = current;
  if (result === "wrong") {
    next = 0;
  } else if (result === "hard") {
    next = Math.max(0, current - 1);
  } else if (result === "easy") {
    next = Math.min(retiredBucketNum, current + 1);
  }
  bucketMap.set(cardId, next);
}

export function ensureBuckets(cards: ICard[], bucketMap: Map<string, number>): Map<string, number> {
  const map = new Map(bucketMap);
  for (const card of cards) {
    if (!map.has(card.id)) {
      map.set(card.id, 0);
    }
  }
  return map;
}

export function getHint(card: ICard): string {
  if (!card.back || typeof card.back !== "string") return "";
  return card.back.length > 0 ? card.back[0] + "..." : "";
}

export function computeProgress(bucketMap: Map<string, number>, retiredBucketNum: number) {
  const perBucket = Array(retiredBucketNum + 1).fill(0);
  let total = 0;
  let retired = 0;

  for (const bucket of bucketMap.values()) {
    if (bucket >= 0 && bucket <= retiredBucketNum) {
      perBucket[bucket]++;
      total++;
      if (bucket === retiredBucketNum) {
        retired++;
      }
    }
  }

  return {
    total,
    retired,
    perBucket,
    percentRetired: total > 0 ? (retired / total) * 100 : 0,
  };
}

export function getTodayNumber(): number {
  const start = new Date("2025-04-30T00:00:00Z");
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function getPracticeSet(bucketMap: Map<string, number>, retiredBucketNum: number, day: number): Set<string> {
  const result = new Set<string>();
  for (const [cardId, bucketNum] of bucketMap.entries()) {
    if (bucketNum >= 0 && bucketNum < retiredBucketNum) {
      if (day % (1 << bucketNum) === 0) {
        result.add(cardId);
      }
    }
  }
  return result;
}

export function updateBucket(
  bucketMap: Map<string, number>,
  cardId: string,
  retiredBucketNum: number,
  result: "wrong" | "hard" | "easy"
): void {
  const current = bucketMap.get(cardId) ?? 0;
  let next = current;
  if (result === "wrong") {
    next = 0;
  } else if (result === "hard") {
    next = Math.max(0, current - 1);
  } else if (result === "easy") {
    next = Math.min(retiredBucketNum, current + 1);
  }
  bucketMap.set(cardId, next);
}
