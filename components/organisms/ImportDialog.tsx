'use client';

import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { validatePGN } from '@/lib/chess/pgn';
import { validateFEN } from '@/lib/chess/fen';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type ImportMode = 'pgn' | 'fen';

export function ImportDialog({ isOpen, onClose }: ImportDialogProps) {
  const { loadPGN, loadFEN } = useGameStore();
  const [mode, setMode] = useState<ImportMode>('pgn');
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fenInputRef = useRef<HTMLInputElement>(null);

  const focusFirstElement = useCallback(() => {
    const container = dialogRef.current;
    if (!container) return;

    const focusTarget =
      (mode === 'pgn' ? textareaRef.current : fenInputRef.current) ??
      container.querySelector<HTMLElement>('[data-autofocus="true"]') ??
      container.querySelector<HTMLElement>(
        'textarea, input, button, [href], [tabindex]:not([tabindex="-1"])'
      );

    focusTarget?.focus();
  }, [mode]);

  useEffect(() => {
    if (!isOpen) return;
    const id = requestAnimationFrame(focusFirstElement);
    return () => cancelAnimationFrame(id);
  }, [isOpen, mode, focusFirstElement]);

  const trapFocus = useCallback(
    (event: KeyboardEvent) => {
      const container = dialogRef.current;
      if (!container) return;

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    []
  );

  const handleClose = useCallback(() => {
    setInput('');
    setError(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleClose();
      } else if (event.key === 'Tab') {
        trapFocus(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, trapFocus, handleClose]);

  if (!isOpen) return null;

  const handleImport = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'pgn') {
        const result = validatePGN(input);
        if (!result.valid) {
          setError(result.error || 'Invalid PGN format');
          return;
        }
        
        const success = loadPGN(input);
        if (!success) {
          setError('Failed to load PGN. Please check the format.');
          return;
        }
      } else {
        const result = validateFEN(input.trim());
        if (!result.valid) {
          setError(result.error || 'Invalid FEN format');
          return;
        }
        
        const success = loadFEN(input.trim());
        if (!success) {
          setError('Failed to load FEN. Please check the format.');
          return;
        }
      }

      // Success - close dialog and reset
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
      role="presentation"
      onMouseDown={handleOverlayClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-dialog-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl border border-terminal-green/20 bg-background-secondary/90 shadow-xl backdrop-blur-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-terminal-green/20 px-6 py-4">
          <h2
            id="import-dialog-title"
            className="text-lg font-mono uppercase tracking-widest text-terminal-green"
          >
            Import Game
          </h2>
          <button
            onClick={handleClose}
            className="rounded p-1 text-text-secondary transition-colors hover:text-terminal-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-terminal-green"
            aria-label="Close import dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 overflow-y-auto px-6 py-6">
          {/* Mode selector */}
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              variant={mode === 'pgn' ? 'primary' : 'ghost'}
              onClick={() => setMode('pgn')}
              className="flex-1"
              data-autofocus={mode === 'pgn'}
            >
              PGN
            </Button>
            <Button
              variant={mode === 'fen' ? 'primary' : 'ghost'}
              onClick={() => setMode('fen')}
              className="flex-1"
              data-autofocus={mode === 'fen'}
            >
              FEN
            </Button>
          </div>

          {/* Input area */}
          <div>
            {mode === 'pgn' ? (
              <div>
                <label className="block text-sm font-mono text-terminal-green mb-2">
                  Paste PGN
                </label>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder='[Event "Casual Game"]&#10;[Site "?"]&#10;&#10;1. e4 e5 2. Nf3 Nc6 3. Bb5...'
                  aria-invalid={!!error}
                  aria-describedby={error ? 'import-dialog-error' : undefined}
                  className={cn(
                    'h-56 w-full resize-none rounded border px-4 py-3 text-sm font-mono transition-colors',
                    error
                      ? 'border-red-400 bg-red-500/10 text-red-100 placeholder:text-red-200 focus:outline-red-400'
                      : 'border-terminal-green/20 bg-background-primary/80 text-text-primary placeholder:text-text-secondary focus:outline focus:outline-terminal-green/30'
                  )}
                />
              </div>
            ) : (
              <Input
                ref={fenInputRef}
                label="Paste FEN"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                error={error || undefined}
              />
            )}

            {error && mode === 'pgn' && (
              <p id="import-dialog-error" className="mt-2 text-sm font-mono text-red-400">
                {error}
              </p>
            )}
          </div>

          {/* Help text */}
          <div className="space-y-1 text-xs font-mono text-text-secondary">
            {mode === 'pgn' ? (
              <>
                <p>• Paste a complete PGN, including headers and moves.</p>
                <p>• Example: [Event {'"Game"'}] 1. e4 e5 2. Nf3...</p>
                <p>• Comments and variations are supported.</p>
              </>
            ) : (
              <>
                <p>• Provide a full FEN string with all six fields.</p>
                <p>• Example: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1</p>
                <p>• Side to move, castling, and move clocks are required.</p>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={!input.trim() || isLoading}
              isLoading={isLoading}
              className="flex-1"
            >
              Import
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
