import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Game from '../Game';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as gemini from '../../../lib/gemini';

// Mock gemini module
vi.mock('../../../lib/gemini', () => ({
  getAIHint: vi.fn(),
  getBoardStateString: vi.fn(() => 'mock-board-state'),
}));

// Mock useControls hook to prevent side effects
vi.mock('../../../hooks/useControls', () => ({
  useControls: vi.fn(),
}));

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

describe('Game AI Hint Button', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.setItem('geminiApiKey', 'test-api-key');
  });

  it('should be disabled and show "Thinking..." when AI hint is requested', async () => {
    // Setup a delayed mock response
    let resolveHint: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolveHint = resolve;
    });
    vi.mocked(gemini.getAIHint).mockReturnValue(promise as any);

    renderGame();

    const aiHintButton = screen.getByLabelText(/Get a movement suggestion from Gemini AI/i);

    // Click the button
    fireEvent.click(aiHintButton);

    // Wait for button to be disabled (mutations can take a tick to start)
    await waitFor(() => {
      expect(aiHintButton).toBeDisabled();
      expect(screen.getByText(/Thinking.../i)).toBeInTheDocument();
    });

    // Resolve the promise
    resolveHint!('up');

    // Wait for it to be enabled again
    await waitFor(() => {
      expect(aiHintButton).not.toBeDisabled();
      expect(screen.getByText(/AI Hint/i)).toBeInTheDocument();
    });
  });

  it('should show error message when Gemini API fails', async () => {
    vi.mocked(gemini.getAIHint).mockRejectedValue(new Error('429 Too many requests'));

    renderGame();

    const aiHintButton = screen.getByLabelText(/Get a movement suggestion from Gemini AI/i);
    fireEvent.click(aiHintButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Too many requests. Please wait a moment before trying again./i)).toBeInTheDocument();
    });

    expect(aiHintButton).not.toBeDisabled();
  });
});
