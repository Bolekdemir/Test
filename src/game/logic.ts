import { TOPIC_BY_ID } from '../data/topics';
import type { AppState, Game, GamePlayer, Phase, Player, Role, Settings, Timer } from './types';

export type Rng = () => number;

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 20;
export const MAX_NAME_LENGTH = 16;

/** Imposters must start outnumbered, so crew always holds the majority. */
export function maxImposters(playerCount: number): number {
  return Math.max(1, Math.floor((playerCount - 1) / 2));
}

export function clampImposters(imposters: number, playerCount: number): number {
  return Math.min(Math.max(1, imposters), maxImposters(playerCount));
}

export function canStart(settings: Settings): boolean {
  return settings.players.length >= MIN_PLAYERS && settings.topicIds.length > 0;
}

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function assignRoles(players: Player[], imposters: number, rng: Rng): GamePlayer[] {
  const count = clampImposters(imposters, players.length);
  const imposterIds = new Set(shuffle(players, rng).slice(0, count).map((p) => p.id));
  return players.map((p) => ({
    ...p,
    role: imposterIds.has(p.id) ? 'imposter' : 'crew',
    alive: true,
  }));
}

/**
 * Picks a word from the chosen topics, avoiding words already played.
 * When every word in the selection has been used, that history resets.
 */
export function pickWord(
  topicIds: string[],
  used: Record<string, string[]>,
  rng: Rng,
): { topicId: string; word: string; used: Record<string, string[]> } {
  const topics = topicIds.map((id) => TOPIC_BY_ID[id]).filter(Boolean);
  if (topics.length === 0) throw new Error('No topics selected');

  let nextUsed = { ...used };
  const fresh = () =>
    topics.flatMap((t) =>
      t.words.filter((w) => !(nextUsed[t.id] ?? []).includes(w)).map((w) => ({ topicId: t.id, word: w })),
    );

  let pool = fresh();
  if (pool.length === 0) {
    for (const t of topics) nextUsed[t.id] = [];
    pool = fresh();
  }

  const choice = pool[Math.floor(rng() * pool.length)];
  nextUsed = { ...nextUsed, [choice.topicId]: [...(nextUsed[choice.topicId] ?? []), choice.word] };
  return { ...choice, used: nextUsed };
}

export function newTimer(timerSec: number | null, now: number): Timer | null {
  if (timerSec === null) return null;
  const durationMs = timerSec * 1000;
  return { durationMs, endsAt: now + durationMs, remainingMs: durationMs };
}

export function timeLeft(timer: Timer, now: number): number {
  return timer.endsAt === null ? timer.remainingMs : Math.max(0, timer.endsAt - now);
}

export function pickStarter(players: GamePlayer[], rng: Rng): string {
  const alive = players.filter((p) => p.alive);
  return alive[Math.floor(rng() * alive.length)].id;
}

/** Speaking order: alive players in seating order, rotated to begin at the starter. */
export function turnOrder(game: Game): GamePlayer[] {
  const alive = game.players.filter((p) => p.alive);
  const start = Math.max(0, alive.findIndex((p) => p.id === game.starterId));
  return [...alive.slice(start), ...alive.slice(0, start)];
}

export function checkWinner(players: GamePlayer[]): Role | null {
  const alive = players.filter((p) => p.alive);
  const imposters = alive.filter((p) => p.role === 'imposter').length;
  const crew = alive.length - imposters;
  if (imposters === 0) return 'crew';
  if (imposters >= crew) return 'imposter';
  return null;
}

/** A game where at least one player joined from a phone. */
export function isPhoneGame(game: Game): boolean {
  return game.players.some((p) => p.deviceId);
}

export function makeRoomCode(rng: Rng = Math.random): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  return Array.from({ length: 4 }, () => alphabet[Math.floor(rng() * alphabet.length)]).join('');
}

export function createGame(
  settings: Settings,
  used: Record<string, string[]>,
  rng: Rng,
): { game: Game; used: Record<string, string[]> } {
  const players = assignRoles(settings.players, settings.imposters, rng);
  const pick = pickWord(settings.topicIds, used, rng);
  return {
    used: pick.used,
    game: {
      players,
      word: pick.word,
      topicId: pick.topicId,
      revealIndex: 0,
      starterId: pickStarter(players, rng),
      round: 1,
      timer: null,
      lastEjectedId: null,
      pendingGuessId: null,
      stolenById: null,
      winner: null,
    },
  };
}

export type Action =
  | { type: 'go'; phase: Extract<Phase, 'home' | 'howto' | 'setup'> }
  | { type: 'addPlayer'; name: string; id: string }
  | { type: 'renamePlayer'; id: string; name: string }
  | { type: 'removePlayer'; id: string }
  | { type: 'toggleTopic'; id: string }
  | { type: 'setTopics'; ids: string[] }
  | { type: 'setImposters'; count: number }
  | { type: 'setTimer'; sec: number | null }
  | { type: 'start'; now: number }
  | { type: 'ready' }
  | { type: 'donePeeking'; now: number }
  | { type: 'pauseTimer'; now: number }
  | { type: 'resumeTimer'; now: number }
  | { type: 'openVote' }
  | { type: 'backToDiscuss' }
  | { type: 'vote'; id: string }
  | { type: 'lastGuess'; correct: boolean; now: number }
  | { type: 'continue'; now: number }
  | { type: 'playAgain'; now: number }
  | { type: 'endGame' }
  | { type: 'setPhones'; on: boolean; room?: string }
  | { type: 'joinPlayer'; id: string; deviceId: string; name: string }
  | { type: 'peeked'; playerId: string }
  | { type: 'peekOnIpad'; playerId: string }
  | { type: 'startDiscussion'; now: number }
  | { type: 'castVote'; voterId: string; targetId: string }
  | { type: 'closeVoting' };

export function cleanName(name: string): string {
  return name.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LENGTH);
}

function nextRound(state: AppState, game: Game, now: number, rng: Rng): AppState {
  return {
    ...state,
    phase: 'discuss',
    game: {
      ...game,
      round: game.round + 1,
      starterId: pickStarter(game.players, rng),
      timer: newTimer(state.settings.timerSec, now),
    },
  };
}

function eject(state: AppState, game: Game, id: string): AppState {
  const target = game.players.find((p) => p.id === id && p.alive);
  if (!target) return state;
  const players = game.players.map((p) => (p.id === id ? { ...p, alive: false } : p));
  return {
    ...state,
    phase: 'verdict',
    game: {
      ...game,
      players,
      ballots: {},
      lastEjectedId: id,
      pendingGuessId: target.role === 'imposter' ? target.id : null,
      winner: checkWinner(players),
    },
  };
}

/**
 * Counts secret ballots once everyone alive has voted (or the host closes voting).
 * One clear leader is voted out. A first tie triggers a revote between the tied
 * players; a second tie means nobody goes out this round.
 */
function resolveBallots(state: AppState, game: Game, force: boolean): AppState {
  const ballots = game.ballots ?? {};
  const voters = game.players.filter((p) => p.alive);
  const allIn = voters.every((v) => ballots[v.id]);
  if (!allIn && !force) return { ...state, game };
  const counts = new Map<string, number>();
  for (const target of Object.values(ballots)) counts.set(target, (counts.get(target) ?? 0) + 1);
  if (counts.size === 0) return { ...state, game };
  const max = Math.max(...counts.values());
  const top = [...counts.entries()].filter(([, n]) => n === max).map(([id]) => id);
  if (top.length === 1) return eject(state, game, top[0]);
  if (!game.revote) {
    return { ...state, phase: 'vote', game: { ...game, ballots: {}, candidates: top, revote: true } };
  }
  return {
    ...state,
    phase: 'verdict',
    game: { ...game, ballots: {}, lastEjectedId: null, pendingGuessId: null },
  };
}

export function reducer(state: AppState, action: Action, rng: Rng = Math.random): AppState {
  const { settings, game } = state;

  switch (action.type) {
    case 'go':
      return { ...state, phase: action.phase };

    case 'addPlayer': {
      const name = cleanName(action.name);
      if (!name || settings.players.length >= MAX_PLAYERS) return state;
      const players = [...settings.players, { id: action.id, name }];
      return { ...state, settings: { ...settings, players } };
    }

    case 'renamePlayer': {
      const name = cleanName(action.name);
      if (!name) return state;
      const players = settings.players.map((p) => (p.id === action.id ? { ...p, name } : p));
      return { ...state, settings: { ...settings, players } };
    }

    case 'removePlayer': {
      const players = settings.players.filter((p) => p.id !== action.id);
      return {
        ...state,
        settings: {
          ...settings,
          players,
          imposters: clampImposters(settings.imposters, Math.max(players.length, MIN_PLAYERS)),
        },
      };
    }

    case 'toggleTopic': {
      const has = settings.topicIds.includes(action.id);
      const topicIds = has
        ? settings.topicIds.filter((id) => id !== action.id)
        : [...settings.topicIds, action.id];
      return { ...state, settings: { ...settings, topicIds } };
    }

    case 'setTopics':
      return { ...state, settings: { ...settings, topicIds: action.ids } };

    case 'setImposters':
      return {
        ...state,
        settings: {
          ...settings,
          imposters: clampImposters(action.count, Math.max(settings.players.length, MIN_PLAYERS)),
        },
      };

    case 'setTimer':
      return { ...state, settings: { ...settings, timerSec: action.sec } };

    case 'start':
    case 'playAgain': {
      if (!canStart(settings)) return state;
      const created = createGame(settings, state.used, rng);
      const phone = isPhoneGame(created.game);
      return {
        ...state,
        phase: phone ? 'deal' : 'pass',
        game: phone ? { ...created.game, peeked: [] } : created.game,
        used: created.used,
      };
    }

    case 'ready':
      return game && state.phase === 'pass' ? { ...state, phase: 'peek' } : state;

    case 'donePeeking': {
      if (!game || state.phase !== 'peek') return state;
      if (isPhoneGame(game)) {
        const id = game.players[game.revealIndex].id;
        const peeked = [...new Set([...(game.peeked ?? []), id])];
        return { ...state, phase: 'deal', game: { ...game, peeked } };
      }
      const next = game.revealIndex + 1;
      if (next < game.players.length) {
        return { ...state, phase: 'pass', game: { ...game, revealIndex: next } };
      }
      return {
        ...state,
        phase: 'discuss',
        game: { ...game, revealIndex: next, timer: newTimer(settings.timerSec, action.now) },
      };
    }

    case 'pauseTimer': {
      if (!game?.timer || game.timer.endsAt === null) return state;
      const remainingMs = timeLeft(game.timer, action.now);
      return { ...state, game: { ...game, timer: { ...game.timer, endsAt: null, remainingMs } } };
    }

    case 'resumeTimer': {
      if (!game?.timer || game.timer.endsAt !== null) return state;
      const endsAt = action.now + game.timer.remainingMs;
      return { ...state, game: { ...game, timer: { ...game.timer, endsAt } } };
    }

    case 'openVote': {
      if (!game || state.phase !== 'discuss') return state;
      if (!isPhoneGame(game)) return { ...state, phase: 'vote' };
      const candidates = game.players.filter((p) => p.alive).map((p) => p.id);
      return { ...state, phase: 'vote', game: { ...game, ballots: {}, candidates, revote: false } };
    }

    case 'backToDiscuss':
      return game && state.phase === 'vote'
        ? { ...state, phase: 'discuss', game: { ...game, ballots: {}, revote: false } }
        : state;

    case 'vote':
      if (!game || state.phase !== 'vote' || isPhoneGame(game)) return state;
      return eject(state, game, action.id);

    case 'castVote': {
      if (!game || state.phase !== 'vote' || !isPhoneGame(game)) return state;
      const voter = game.players.find((p) => p.id === action.voterId && p.alive);
      const valid = (game.candidates ?? []).includes(action.targetId) && action.targetId !== action.voterId;
      if (!voter || !valid) return state;
      const ballots = { ...(game.ballots ?? {}), [voter.id]: action.targetId };
      return resolveBallots(state, { ...game, ballots }, false);
    }

    case 'closeVoting':
      if (!game || state.phase !== 'vote' || !isPhoneGame(game)) return state;
      return resolveBallots(state, game, true);

    case 'setPhones':
      return {
        ...state,
        settings: {
          ...settings,
          // Turning phones off keeps everyone, as plain one-iPad players.
          players: action.on ? settings.players : settings.players.map(({ deviceId: _drop, ...p }) => p),
          phones: action.on,
          room: action.on ? (settings.room ?? action.room ?? makeRoomCode(rng)) : settings.room,
        },
      };

    case 'joinPlayer': {
      const known = settings.players.find((p) => p.deviceId === action.deviceId);
      const name = cleanName(action.name);
      if (known) {
        if (!name || name === known.name || game) return state;
        const players = settings.players.map((p) => (p.deviceId === action.deviceId ? { ...p, name } : p));
        return { ...state, settings: { ...settings, players } };
      }
      if (game || !settings.phones || !name || settings.players.length >= MAX_PLAYERS) return state;
      const players = [...settings.players, { id: action.id, name, deviceId: action.deviceId }];
      return { ...state, settings: { ...settings, players } };
    }

    case 'peeked': {
      if (!game || !game.players.some((p) => p.id === action.playerId)) return state;
      if ((game.peeked ?? []).includes(action.playerId)) return state;
      return { ...state, game: { ...game, peeked: [...(game.peeked ?? []), action.playerId] } };
    }

    case 'peekOnIpad': {
      if (!game || state.phase !== 'deal') return state;
      const index = game.players.findIndex((p) => p.id === action.playerId);
      if (index < 0) return state;
      return { ...state, phase: 'pass', game: { ...game, revealIndex: index } };
    }

    case 'startDiscussion':
      if (!game || state.phase !== 'deal') return state;
      return {
        ...state,
        phase: 'discuss',
        game: { ...game, revealIndex: game.players.length, timer: newTimer(settings.timerSec, action.now) },
      };

    case 'continue': {
      if (!game || state.phase !== 'verdict') return state;
      if (game.pendingGuessId) return { ...state, phase: 'guess' };
      if (game.winner) return { ...state, phase: 'over' };
      return nextRound(state, game, action.now, rng);
    }

    case 'lastGuess': {
      if (!game || state.phase !== 'guess' || !game.pendingGuessId) return state;
      if (action.correct) {
        return {
          ...state,
          phase: 'over',
          game: { ...game, winner: 'imposter', stolenById: game.pendingGuessId, pendingGuessId: null },
        };
      }
      const resolved = { ...game, pendingGuessId: null };
      if (resolved.winner) return { ...state, phase: 'over', game: resolved };
      return nextRound(state, resolved, action.now, rng);
    }

    case 'endGame':
      return { ...state, phase: 'setup', game: null };
  }
}

export const DEFAULT_STATE: AppState = {
  phase: 'home',
  settings: { players: [], topicIds: ['food', 'animals', 'places'], imposters: 1, timerSec: 180 },
  game: null,
  used: {},
};
