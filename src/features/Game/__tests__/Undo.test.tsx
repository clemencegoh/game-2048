import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Game from '../Game';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// We want to use the real useControls for better integration testing
// unless it causes issues.

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderGame = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <Game />
    </QueryClientProvider>
  );
};

describe('Game Undo Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Undo button should be disabled initially', () => {
    renderGame();
    const undoButton = screen.getByLabelText(/Undo last move/i);
    expect(undoButton).toBeDisabled();
  });

  it('Undo button should be enabled after a move and restore state', async () => {
    renderGame();

    // Initial score is 0
    const scoreBox = screen.getByLabelText(/Current Score: 0/i);
    expect(scoreBox).toBeInTheDocument();

    // Trigger moves until something changes. 
    // We'll try all directions to ensure at least one change happens.
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    fireEvent.keyDown(window, { key: 'ArrowUp' });

    // Wait for at least one move to process
    await waitFor(() => {
      const undoButton = screen.getByLabelText(/Undo last move/i);
      expect(undoButton).not.toBeDisabled();
    }, { timeout: 2000 });

    // Click Undo
    const undoButton = screen.getByLabelText(/Undo last move/i);
    fireEvent.click(undoButton);

    // Verify Undo button is disabled again
    expect(undoButton).toBeDisabled();

    // Verify score is back to 0 (or whatever it was initially)
    expect(screen.getByLabelText(/Current Score: 0/i)).toBeInTheDocument();
  });
});
