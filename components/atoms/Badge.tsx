import { cn } from '@/lib/utils/cn';

export type BadgeVariant = 'blunder' | 'mistake' | 'inaccuracy' | 'brilliant' | 'book' | 'best';

interface BadgeProps {
  variant: BadgeVariant;
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ variant, children, className }: BadgeProps) {
  const variants = {
    blunder: 'bg-red-500/20 text-red-400 border-red-500/50',
    mistake: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    inaccuracy: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    brilliant: 'bg-terminal-green/20 text-terminal-green border-terminal-green/50',
    book: 'bg-terminal-blue/20 text-terminal-blue border-terminal-blue/50',
    best: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
  };

  const labels = {
    blunder: '??',
    mistake: '?',
    inaccuracy: '?!',
    brilliant: '!!',
    book: 'Book',
    best: '✓',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border',
        variants[variant],
        className
      )}
    >
      {children || labels[variant]}
    </span>
  );
}
