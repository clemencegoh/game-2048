---
name: 2048 Game General Overview
description: High-level overview of the 2048 implementation, project structure, and key features.
---

# 2048 Game Overview

This project is a premium implementation of the classic 2048 puzzle game, built with React and TypeScript.

## Core Features

- **Responsive Gameplay**: Supports both keyboard (arrow keys) and mobile (swipe gestures).
- **Coordinate-Driven Overlay**: Tiles are absolutely positioned using `x` and `y` coordinates, enabling smooth CSS transforms and transitions.
- **Two-Phase Animation System**: Handles sliding and merging transitions separately for fluid visuals.
- **Dual AI Suggestion Engines**: 
  - **Heuristic Engine**: Provides immediate "best move" hints using evaluation logic.
  - **Gemini AI Engine**: Leverages the `gemini-2.0-flash` model for intelligent, context-aware move suggestions.
- **Session-Based API Configuration**: Users manage their own Gemini API key through an interactive UI form, with persistence in `sessionStorage` for secure, per-session usage.
- **Persistence**: Automatically saves the highest score to local storage.
- **Undo Support**: Allows players to revert their last 20 moves, including board state and score restoration.

## Project Structure

- `src/App.tsx`: Main entry point.
- `src/features/Game/`: Contains the `Game` component, managing state-driven tile identities and the animation lifecycle.
- `src/lib/`:
  - `gameEngine.ts`: Logic for tile movements, merges, and heuristic evaluation using a pure state-driven approach.
  - `gemini.ts`: Gemini AI API integration.
- `src/hooks/useControls.ts`: Cross-platform input handling.
- `src/components/Tile.tsx`: Atomic UI component using CSS transforms for positioning and pop/merge animations.

## Key Paradigms

1. **State-Driven Identity**: Each tile has a stable `id` managed in the React state. Engine functions are pure and return updated `nextId` values to preserve tile identities across frames.
2. **Two-Phase Move Lifecycle**: Moves are executed in two steps (Sliding Phase → Merge/Spawn Phase) to ensure animations complete before state cleanup.
3. **Decoupled Logic**: Game mechanics and AI are decoupled from the UI, allowing for comprehensive unit testing of the state transition logic.
4. **History-Based Restoration**: State snapshots are stored in a bounded stack, enabling "Undo" functionality that maintains score consistency and tile positions.
5. **Hardware-Accelerated Motion**: Uses CSS `transform: translate()` and `transition` for 60fps movement.
