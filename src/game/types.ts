export type Role = 'crew' | 'imposter';

export interface Player {
  id: string;
  name: string;
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
  | 'discuss'
  | 'vote'
  | 'verdict'
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
  winner: Role | null;
}

export interface AppState {
  phase: Phase;
  settings: Settings;
  game: Game | null;
  /** Words already played, per topic, so they don't repeat. */
  used: Record<string, string[]>;
}
