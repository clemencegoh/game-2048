import { GoogleGenerativeAI } from "@google/generative-ai";
import type { 
  Direction,
  Tile
} from './gameEngine';
import { GRID_SIZE } from './gameEngine';

export const getBoardStateString = (tiles: Tile[]): string => {
  const board: (number | null)[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
  tiles.filter(t => !t.isDeleted).forEach(t => {
    board[t.y][t.x] = t.value;
  });

  return board.map(row => row.map(cell => cell === null ? 0 : cell).join(", ")).join("\n");
};

export const getAIHint = async (tiles: Tile[], apiKey: string): Promise<Direction> => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const boardString = getBoardStateString(tiles);

  const prompt = `
    You are an expert at the game 2048. 
    The current board state is represented by a 4x4 grid of numbers (0 represents an empty cell):
    ${boardString}

    Based on this board state, what is the single best move to make? 
    Respond with ONLY one of the following words: "up", "down", "left", or "right".
    Do not include any other text or explanation.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text().trim().toLowerCase();

  if (['up', 'down', 'left', 'right'].includes(text)) {
    return text as Direction;
  }

  // Fallback #1 - Regex parsing
  const match = text.match(/(up|down|left|right)/);
  if (match) {
    return match[0] as Direction;
  }

  // Fallback #2 - Check for keywords
  if (text.includes('up')) return 'up';
  if (text.includes('down')) return 'down';
  if (text.includes('left')) return 'left';
  if (text.includes('right')) return 'right';

  // Fallback if AI gives unexpected response
  console.warn("Gemini gave unexpected response:", text);
  return "up"; 
};
