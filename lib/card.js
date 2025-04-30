/**
 * Card ADT Implementation
 *
 * Represents a flashcard with front and back sides, difficulty tracking, and
 * spaced repetition data.
 */
import { CardDifficulty } from "./types";
export class Card {
    id;
    front;
    back;
    createdAt;
    lastReviewedAt;
    reviewCount;
    difficulty;
    dueDate;
    source;
    bucket; // 0-5, explicit bucket for Modified-Leitner
    /**
     * Creates a new Card
     *
     * @param front The front content of the card (question/prompt)
     * @param back The back content of the card (answer/definition)
     * @param source URL where the card was created
     */
    constructor(front, back, source, id, createdAt, lastReviewedAt, reviewCount, difficulty, dueDate, bucket) {
        // Initialize core properties
        this.id = id || this.generateId();
        this.front = front;
        this.back = back;
        this.source = source;
        // Initialize tracking properties
        this.createdAt = createdAt || Date.now();
        this.lastReviewedAt = lastReviewedAt || null;
        this.reviewCount = reviewCount || 0;
        this.difficulty = difficulty || CardDifficulty.MEDIUM;
        this.dueDate = dueDate || this.createdAt; // Due immediately by default
        this.bucket = bucket ?? 0; // Start in bucket 0
        // Verify representation
        this.checkRep();
    }
    /**
     * Review this card and update its state based on the reported difficulty
     * Implements Modified-Leitner explicit bucket logic
     *
     * @param difficulty How difficult the card was for the user
     */
    review(difficulty) {
        // Update review metadata
        this.lastReviewedAt = Date.now();
        this.reviewCount++;
        this.difficulty = difficulty;
        // Modified-Leitner bucket logic
        if (difficulty === CardDifficulty.EASY) {
            this.bucket = Math.min(this.bucket + 1, 5);
        }
        else if (difficulty === CardDifficulty.HARD) {
            this.bucket = Math.max(this.bucket - 1, 0);
        }
        else {
            // MEDIUM or wrong
            this.bucket = 0;
        }
        // Set next due date based on bucket
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
                break; // "retired" bucket, very long interval
        }
        this.dueDate = this.lastReviewedAt + intervalDays * dayInMs;
        this.checkRep();
    }
    /**
     * Generates a unique ID
     */
    generateId() {
        return "card_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
    }
    /**
     * Creates a Card instance from JSON object
     */
    static fromJSON(data) {
        return new Card(data.front, data.back, data.source, data.id, data.createdAt, data.lastReviewedAt, data.reviewCount, data.difficulty, data.dueDate, data.bucket);
    }
    /**
     * Converts card to serializable object
     */
    toJSON() {
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
    /**
     * Verifies the representation invariant
     */
    checkRep() {
        // Check invariants
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
        // All checks passed
    }
}
