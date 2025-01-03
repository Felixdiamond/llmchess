import { useGame } from '../contexts/GameContext';

export function GameControls() {
  const { state, resetGame, undoMove, setAIColor, setDifficulty, setProvider } = useGame();

  return (
    <div className="flex flex-col h-full bg-[#25262b] rounded-xl border border-[#2c2e33] shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Game Controls</h2>
        <div className="flex gap-2">
          <button
            onClick={undoMove}
            disabled={state.history.length === 0 || state.isThinking}
            className="p-2 bg-[var(--background)] hover:bg-[var(--surface-hover)] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
            title="Undo last move"
          >
            <svg className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={resetGame}
            disabled={state.isThinking}
            className="p-2 bg-[var(--background)] hover:bg-[var(--surface-hover)] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
            title="Reset game"
          >
            <svg className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--border)]">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">Play as</label>
          <div className="grid grid-cols-3 gap-2">
            {['white', 'black', 'random'].map((color) => (
              <button
                key={color}
                onClick={() => setAIColor(color === 'white' ? 'b' : color === 'black' ? 'w' : 'random')}
                disabled={state.isThinking}
                className={`
                  p-2 rounded-lg border transition-all
                  ${state.settings.aiColor === (color === 'white' ? 'b' : color === 'black' ? 'w' : 'random')
                    ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                    : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)]'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--border)]">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">Difficulty</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 1, label: 'Easy' },
              { value: 2, label: 'Medium' },
              { value: 3, label: 'Hard' }
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setDifficulty(value as 1 | 2 | 3)}
                disabled={state.isThinking}
                className={`
                  p-2 rounded-lg border transition-all
                  ${state.settings.difficulty === value
                    ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                    : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)]'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--border)]">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">AI Provider</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'gpt4', label: 'GPT-4' },
              { value: 'claude', label: 'Claude' },
              { value: 'gemini', label: 'Gemini' }
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setProvider(value as 'gpt4' | 'claude' | 'gemini')}
                disabled={state.isThinking}
                className={`
                  p-2 rounded-lg border transition-all
                  ${state.settings.provider === value
                    ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                    : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)]'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {state.isThinking && (
        <div className="mt-6 flex items-center justify-center p-3 bg-[var(--background)] rounded-lg border border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-ping"></div>
            <span className="text-sm text-[var(--text-secondary)]">AI is thinking...</span>
          </div>
        </div>
      )}
    </div>
  );
} 