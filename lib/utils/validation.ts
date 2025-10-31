import { z } from 'zod';

/**
 * PGN validation schema
 * Validates PGN format for chess games
 */
export const PGNSchema = z
  .string()
  .min(10, 'PGN is too short')
  .max(100_000, 'PGN is too large (max 100KB)')
  .refine(
    (pgn) => {
      // Basic validation - proper PGN structure
      return /\[Event/.test(pgn) || /^1\./.test(pgn) || /^\[/.test(pgn);
    },
    { message: 'Invalid PGN format' }
  );

/**
 * FEN validation schema
 * Validates Forsyth-Edwards Notation for chess positions
 */
export const FENSchema = z
  .string()
  .regex(
    /^([rnbqkpRNBQKP1-8]+\/){7}[rnbqkpRNBQKP1-8]+\s[wb]\s(-|[KQkq]{1,4})\s(-|[a-h][36])\s\d+\s\d+$/,
    'Invalid FEN format'
  );

/**
 * Chess.com username validation schema
 */
export const UsernameSchema = z
  .string()
  .min(3, 'Username too short')
  .max(50, 'Username too long')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens');

/**
 * Month/Year validation for Chess.com archives
 */
export const ArchiveDateSchema = z.object({
  year: z.number().int().min(2007).max(new Date().getFullYear()),
  month: z.number().int().min(1).max(12),
});

/**
 * Engine options schema
 */
export const EngineOptionsSchema = z.object({
  depth: z.number().int().min(1).max(30).default(18),
  multiPV: z.number().int().min(1).max(5).default(2),
  threads: z.number().int().min(1).max(8).default(2),
  hash: z.number().int().min(8).max(1024).default(64),
});

export type EngineOptions = z.infer<typeof EngineOptionsSchema>;
