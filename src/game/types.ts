export type Role = 'crew' | 'imposter';

export interface Player {
  id: string;
  name: string;
  /** Set when the player joined from their own phone. */
  deviceId?: string;
}

export interface GamePlayer extends Player {
  role: Role;
  alive: boolean;
}

export interface Settings {
  players: Player[];
  topicIds: string[];
  imposters: number;
  /** Discussion length in seconds; null means no time limit. */
  timerSec: number | null;
  /** Play with phones: players can join the room from their own phone. */
  phones?: boolean;
  /** Four-letter room code while phones are on. */
  room?: string | null;
}

export interface Timer {
  durationMs: number;
  /** Epoch ms when time runs out while running; null while paused. */
  endsAt: number | null;
  /** Remaining time captured when paused. */
  remainingMs: number;
}

export type Phase =
  | 'home'
  | 'howto'
  | 'setup'
  | 'pass'
  | 'peek'
  | 'deal'
  | 'discuss'
  | 'vote'
  | 'verdict'
  | 'guess'
  | 'over';

export interface Game {
  players: GamePlayer[];
  word: string;
  topicId: string;
  /** Index into players of whoever is viewing their role. */
  revealIndex: number;
  /** Id of the player who speaks first this round. */
  starterId: string;
  round: number;
  timer: Timer | null;
  lastEjectedId: string | null;
  /** Caught imposter who still gets one guess at the word before the result stands. */
  pendingGuessId?: string | null;
  /** Imposter whose correct last-chance guess won the game. */
  stolenById?: string | null;
  winner: Role | null;
  /** Phone games: players who have seen their card. */
  peeked?: string[];
  /** Phone games: secret ballots this vote, voter id to target id. */
  ballots?: Record<string, string>;
  /** Phone games: who can be voted for (everyone alive, or the tied players in a revote). */
  candidates?: string[];
  revote?: boolean;
}

export interface AppState {
  phase: Phase;
  settings: Settings;
  game: Game | null;
  /** Words already played, per topic, so they don't repeat. */
  used: Record<string, string[]>;
}
