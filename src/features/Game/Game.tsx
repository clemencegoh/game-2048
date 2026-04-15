import { useState, useCallback, useEffect, useRef, Activity } from 'react';
import './Game.css';
import type {
  Tile as TileModel,
  Direction,
} from '../../lib/gameEngine';
import {
  initializeBoard,
  moveBoard,
  spawnTile,
  isGameOver,
  getBestMove
} from '../../lib/gameEngine';
import { useControls } from '../../hooks/useControls';
import Tile from '../../components/Tile';
import { useMutation } from '@tanstack/react-query';
import { getAIHint, getBoardStateString } from '../../lib/gemini';
import { Loader2, Settings } from 'lucide-react';
import ConfigModal from '../../components/ConfigModal';

const Game = () => {
  const [{ tiles, nextId }, setState] = useState<{ tiles: TileModel[], nextId: number }>(() => initializeBoard());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => Number(localStorage.getItem('bestScore')) || 0);
  const [status, setStatus] = useState<{ won: boolean; lost: boolean }>({ won: false, lost: false });
  const [hint, setHint] = useState<Direction | null>(null);
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem('geminiApiKey') || '');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [lastHintedBoard, setLastHintedBoard] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const isMovingRef = useRef(false);

  const geminiMutation = useMutation({
    mutationFn: (tiles: TileModel[]) => getAIHint(tiles, apiKey),
    onSuccess: (direction, variables) => {
      setHint(direction);
      setLastHintedBoard(getBoardStateString(variables));
      setAiError(null);
    },
    onError: (error: any) => {
      console.error("Gemini Error:", error);
      if (error?.message?.includes('429') || error?.status === 429) {
        setAiError("Too many requests. Please wait a moment before trying again.");
      } else {
        setAiError("An error occurred while getting AI hint.");
      }
    }
  });

  const handleMove = useCallback((direction: Direction) => {
    if (status.won || status.lost || isMovingRef.current) return;

    const { animationTiles, finalTiles, score: moveScore, changed, nextId: newNextId } = moveBoard(tiles, nextId, direction);

    if (changed) {
      isMovingRef.current = true;
      setState(s => ({ ...s, tiles: animationTiles }));
      setScore(s => s + moveScore);
      setHint(null);

      // Wait for animation
      setTimeout(() => {
        setState(() => {
          const { tiles: boardWithNewTile, nextId: spawnedNextId } = spawnTile(finalTiles, newNextId);

          const newStatus = isGameOver(boardWithNewTile);
          setStatus(newStatus);
          isMovingRef.current = false;
          return { tiles: boardWithNewTile, nextId: spawnedNextId };
        });
      }, 100);
    }
  }, [tiles, nextId, status]);

  useControls(handleMove);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem('bestScore', score.toString());
    }
  }, [score, bestScore]);

  const resetGame = () => {
    setState(initializeBoard());
    setScore(0);
    setBestScore(0);
    setStatus({ won: false, lost: false });
    setHint(null);
    setLastHintedBoard(null);
    setAiError(null);
  };

  const showHint = () => {
    const bestMove = getBestMove(tiles);
    setHint(bestMove);
  };

  const showHintAI = () => {
    if (status.won || status.lost) return;
    if (!apiKey) {
      setIsConfigOpen(true);
      return;
    }

    const currentBoardString = getBoardStateString(tiles);
    if (hint && lastHintedBoard === currentBoardString) {
      // Already have a hint for this board state
      return;
    }

    setAiError(null);
    geminiMutation.mutate(tiles);
  };

  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    sessionStorage.setItem('geminiApiKey', newKey);
  };

  const renderTiles = () => {
    return tiles.map(tile => (
      <Tile key={tile.id} tile={tile} />
    ));
  };

  return (
    <div className="game-container" role="application" aria-label="2048 Game">
      <div className="header">
        <div className="title-box">
          <h1>2048</h1>
        </div>
        <div className="score-container" aria-live="polite" aria-atomic="true">
          <div className="score-box" aria-label={`Current Score: ${score}`}>
            <div className="score-label" aria-hidden="true">Score</div>
            <div className="score-value">{score}</div>
          </div>
          <div className="score-box" aria-label={`Best Score: ${bestScore}`}>
            <div className="score-label" aria-hidden="true">Best</div>
            <div className="score-value">{bestScore}</div>
          </div>
          <button
            className="btn-config"
            onClick={() => setIsConfigOpen(true)}
            aria-label="API Configuration"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="controls">
        <div>
          <button className="btn btn-outline" onClick={resetGame} aria-label="Start a new game">New Game</button>
        </div>
        <div className='controls-2'>
          <button className="btn" onClick={showHint} aria-label="Get a movement suggestion from AI">Hint</button>
          <button
            className="btn btn-gemini"
            onClick={showHintAI}
            disabled={geminiMutation.isPending}
            aria-label="Get a movement suggestion from Gemini AI"
          >
            {geminiMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Thinking...
              </>
            ) : (
              'AI Hint'
            )}
          </button>
        </div>

      </div>

      {hint && (
        <div className="hint-text" aria-live="polite">
          AI Suggests: <span style={{ textTransform: 'capitalize', fontWeight: 'bold', color: 'var(--accent)' }}>{hint}</span>
        </div>
      )}

      {aiError && (
        <div className="hint-text error-text" aria-live="polite" style={{ color: '#ef4444' }}>
          {aiError}
        </div>
      )}

      <div
        className="grid-container"
        role="grid"
        aria-label="2048 game board"
        aria-readonly="true"
      >
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="grid-cell"
            role="gridcell"
            aria-label={`Empty cell at index ${i}`}
          />
        ))}
        <div className="tiles-container">
          {renderTiles()}
        </div>

        {(status.won || status.lost) && (
          <div className="overlay" role="alert" aria-live="assertive">
            <h2>{status.won ? 'You Win!' : 'Game Over!'}</h2>
            <button className="btn" onClick={resetGame} aria-label="Start a new game after finishing">Try Again</button>
          </div>
        )}
      </div>

      <div className="hint-text" style={{ marginTop: '20px' }} aria-hidden="true">
        Use <b>Arrow Keys</b> or <b>Swipe</b> to move!
      </div>

      <Activity mode={isConfigOpen ? 'visible' : 'hidden'}>
        <ConfigModal
          isOpen={true}
          onClose={() => setIsConfigOpen(false)}
          onSave={handleSaveApiKey}
          initialApiKey={apiKey}
        />
      </Activity >
    </div>
  );
};

export default Game;
