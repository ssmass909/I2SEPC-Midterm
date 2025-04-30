/**
 * Types for the Flashcard Extension
 */
/** Difficulty levels for cards */
export var CardDifficulty;
(function (CardDifficulty) {
    CardDifficulty["EASY"] = "easy";
    CardDifficulty["MEDIUM"] = "medium";
    CardDifficulty["HARD"] = "hard";
})(CardDifficulty || (CardDifficulty = {}));
/** Hand gesture types recognized by the system */
export var HandGesture;
(function (HandGesture) {
    HandGesture["THUMBS_UP"] = "thumbs_up";
    HandGesture["FLAT_HAND"] = "flat_hand";
    HandGesture["THUMBS_DOWN"] = "thumbs_down";
    HandGesture["NO_HAND"] = "no_hand"; // No gesture detected
})(HandGesture || (HandGesture = {}));
/** Mapping of hand gestures to card difficulties */
export const GestureToDifficulty = {
    [HandGesture.THUMBS_UP]: CardDifficulty.EASY,
    [HandGesture.FLAT_HAND]: CardDifficulty.MEDIUM,
    [HandGesture.THUMBS_DOWN]: CardDifficulty.HARD,
    [HandGesture.NO_HAND]: null
};
