---
name: 2048 Game Engine Logic
description: Technical details, implementation patterns, and gotchas for the 2048 engine logic.
---

# Game Engine Logic Deep Dive

The `gameEngine.ts` library is the heart of the 2048 implementation. It focuses on pure, deterministic state transitions.

## Implementation Details

### Tile-Based State
Instead of a 2D array, the game state is a flat array of `Tile` objects. 
- **Coordinates**: Each tile has `x` and `y` properties (0-3) determining its position in the grid.
- **Identity**: Tiles have persistent `id`s, which are critical for React's key-based reconciliation and CSS transitions.

### Two-Phase Move Logic
Movement is calculated by `moveBoard` which returns two distinct sets of tiles:
1. **Animation Tiles**: The original tiles moved to their destination coordinates. Used for the 100ms sliding transition.
2. **Final Tiles**: The post-merge state where combined tiles are replaced by a new `merged` tile and deleted tiles are removed.

### Stable ID Management
The game engine is pure regarding IDs. The `nextId` counter is passed from the UI to engine functions (`moveBoard`, `spawnTile`) and returned back. This prevents ID collisions and ensures AI simulations (heuristic/Gemini) don't consume the main state's ID sequence.

## Known Gotchas

> [!IMPORTANT]
> **State Cleaning**: Always filter out `isDeleted` tiles before performing new logical operations. The `isDeleted` flag is used exclusively to keep tiles in the DOM during their "slide-out" animation.

> [!WARNING]
> **Ref-Based Locking**: Use a `useRef` (e.g., `isMovingRef`) to synchronously guard `handleMove`. React's asynchronous state updates for `isMoving` can lead to race conditions where multiple moves are triggered in a single frame, causing double-spawned tiles or ID conflicts.

> [!NOTE]
> **Heuristic Evaluation**: When evaluating moves in `getBestMove`, always use the `finalTiles` result from `moveBoard` to assess the board's health (empty cells, monotonicity).

> [!NOTE]
> **Endgame Detection**: The game is lost only if *no* moves (Up, Down, Left, or Right) result in a `changed: true` flag and there are no empty cells. Simply checking if the board is full is insufficient.

## AI Integration
The AI hint system is split between a local heuristic engine and a remote Gemini API.
- **API Key Management**: To avoid exposing secrets, the Gemini API key is never stored in the codebase or environment files. It is passed explicitly from the UI layer (where it's stored in `sessionStorage`) to the `getAIHint` integration.
- **Graceful Fallbacks**: The Gemini integration includes multiple fallback layers (parsing, keyword matching) to handle non-structured responses from the LLM.
- **Rate Limiting & Caching**: To mitigate `429 Too Many Requests` errors from the Gemini API:
  - **Board Caching**: Use `getBoardStateString` to generate a hash/string of the current board. The UI caches the last board state that requested a hint and prevents redundant API calls if the board hasn't changed.
  - **Visual Feedback**: The button should be disabled (`disabled={isPending}`) and styled (reduced opacity, grayscale) during the "Thinking" state to prevent rapid double-clicks.
  - **Error Handling**: Monitor for status code `429` in the API response and display a user-friendly "wait a moment" message instead of a generic failure.
