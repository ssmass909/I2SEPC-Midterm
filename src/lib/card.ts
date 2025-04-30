import { ICard, CardDifficulty } from "./types";

export class Card implements ICard {
  readonly id: string;
  front: string;
  back: string;
  createdAt: number;
  lastReviewedAt: number | null;
  reviewCount: number;
  difficulty: CardDifficulty;
  dueDate: number;
  source: string;
  bucket: number;

  constructor(
    front: string,
    back: string,
    source: string,
    id?: string,
    createdAt?: number,
    lastReviewedAt?: number | null,
    reviewCount?: number,
    difficulty?: CardDifficulty,
    dueDate?: number,
    bucket?: number
  ) {
    this.id = id || this.generateId();
    this.front = front;
    this.back = back;
    this.source = source;

    this.createdAt = createdAt || Date.now();
    this.lastReviewedAt = lastReviewedAt || null;
    this.reviewCount = reviewCount || 0;
    this.difficulty = difficulty || CardDifficulty.MEDIUM;
    this.dueDate = dueDate || this.createdAt;
    this.bucket = bucket ?? 0;

    this.checkRep();
  }

  review(difficulty: CardDifficulty): void {
    this.lastReviewedAt = Date.now();
    this.reviewCount++;
    this.difficulty = difficulty;

    if (difficulty === CardDifficulty.EASY) {
      this.bucket = Math.min(this.bucket + 1, 5);
    } else if (difficulty === CardDifficulty.HARD) {
      this.bucket = Math.max(this.bucket - 1, 0);
    } else {
      this.bucket = 0;
    }

    const dayInMs = 24 * 60 * 60 * 1000;
    let intervalDays = 1;
    switch (this.bucket) {
      case 0:
        intervalDays = 1;
        break;
      case 1:
        intervalDays = 2;
        break;
      case 2:
        intervalDays = 4;
        break;
      case 3:
        intervalDays = 8;
        break;
      case 4:
        intervalDays = 16;
        break;
      case 5:
        intervalDays = 1000;
        break;
    }
    this.dueDate = this.lastReviewedAt + intervalDays * dayInMs;

    this.checkRep();
  }

  private generateId(): string {
    return "card_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
  }

  static fromJSON(data: ICard & { bucket?: number }): Card {
    return new Card(
      data.front,
      data.back,
      data.source,
      data.id,
      data.createdAt,
      data.lastReviewedAt,
      data.reviewCount,
      data.difficulty,
      data.dueDate,
      data.bucket
    );
  }

  toJSON(): ICard & { bucket: number } {
    return {
      id: this.id,
      front: this.front,
      back: this.back,
      createdAt: this.createdAt,
      lastReviewedAt: this.lastReviewedAt,
      reviewCount: this.reviewCount,
      difficulty: this.difficulty,
      dueDate: this.dueDate,
      source: this.source,
      bucket: this.bucket,
    };
  }

  private checkRep(): void {
    if (!this.id || this.id.trim() === "") {
      throw new Error("Card ID cannot be empty");
    }

    if (!this.front || this.front.trim() === "") {
      throw new Error("Card front cannot be empty");
    }

    if (this.createdAt > Date.now()) {
      throw new Error("Card creation date cannot be in the future");
    }

    if (this.lastReviewedAt !== null && this.lastReviewedAt > Date.now()) {
      throw new Error("Last review date cannot be in the future");
    }

    if (this.reviewCount < 0) {
      throw new Error("Review count cannot be negative");
    }

    if (this.bucket < 0 || this.bucket > 5) {
      throw new Error("Bucket must be between 0 and 5");
    }
  }
}
