# 2048 Game - Notes for humans

## Tech stack and game overview
For overview of the game itself, including core features and project structure, see [SKILL.md](SKILL.md). That file is updated with every new feature/change by an AI agent, and will be the single source of truth for the game's features and structure.

This serves as a README for humans for my own reflections and notes, with no AI generated documentation.

## Reflections during the process

### AI agents' role
- AI was used here to generate the features and core game logic, as well as the tests.
- It was also used here to guide the architecture and design thinking on how the game should function and work.

### What went smoothly
- The AI agents were able to generate an initial game that was mostly functional.
- The UI design was pretty good, with nice colors chosen and a good layout.

### What required tweaks
- The User Experience was initially not mobile friendly.
- Animations weren't part of the initial one-shot response, and had to be added in later.
- The initial implementation of the game followed a naive approach where the entire game board was re-rendered on every move. This made a smooth animation impossible as every Tile was unmounted and remounted on every move. This was fixed by introducing a state-driven identity for each tile, and using CSS transforms to animate the tiles.

### Future improvements to consider
- Other themes
- Ability to reset high score

