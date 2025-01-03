import { useGame } from '../contexts/GameContext';

export function ErrorDisplay() {
  const { error, clearError } = useGame();

  if (!error) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-[var(--surface)] border border-red-500/20 rounded-lg p-4 shadow-lg backdrop-blur-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-red-400">
            Error with {error.provider}
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {error.message}
          </p>
          {error.retryable && (
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              You can try again or switch to a different AI provider.
            </p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={clearError}
            className="inline-flex text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 