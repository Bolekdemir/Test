import { describe, expect, it } from 'vitest';
import { TOPIC_BY_ID } from '../data/topics';
import {
  DEFAULT_STATE,
  assignRoles,
  checkWinner,
  maxImposters,
  pickWord,
  reducer,
  timeLeft,
  turnOrder,
  type Action,
} from './logic';
import type { AppState, GamePlayer } from './types';

/** Deterministic pseudo-random generator so tests are repeatable. */
function seeded(seed = 42) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const names = ['Mav', 'Ada', 'Bo', 'Cy', 'Di'];
const players = names.map((name, i) => ({ id: `p${i}`, name }));

function run(state: AppState, actions: Action[], rng = seeded()): AppState {
  return actions.reduce((s, a) => reducer(s, a, rng), state);
}

function withPlayers(imposters = 2, timerSec: number | null = 60): AppState {
  return {
    ...DEFAULT_STATE,
    phase: 'setup',
    settings: { players, topicIds: ['food'], imposters, timerSec },
  };
}

describe('imposter limits', () => {
  it('keeps the crew in the majority', () => {
    expect(maxImposters(3)).toBe(1);
    expect(maxImposters(4)).toBe(1);
    expect(maxImposters(5)).toBe(2);
    expect(maxImposters(7)).toBe(3);
  });

  it('assigns exactly the requested number of imposters', () => {
    const roles = assignRoles(players, 2, seeded(7));
    expect(roles.filter((p) => p.role === 'imposter')).toHaveLength(2);
  });

  it('clamps imposters when players are removed', () => {
    const s = run(withPlayers(2), [{ type: 'removePlayer', id: 'p4' }]);
    expect(s.settings.imposters).toBe(1);
  });
});

describe('word picking', () => {
  it('never repeats a word until the topic runs out', () => {
    const total = TOPIC_BY_ID.food.words.length;
    let used: Record<string, string[]> = {};
    const seen = new Set<string>();
    const rng = seeded(3);
    for (let i = 0; i < total; i++) {
      const pick = pickWord(['food'], used, rng);
      expect(seen.has(pick.word)).toBe(false);
      seen.add(pick.word);
      used = pick.used;
    }
    expect(seen.size).toBe(total);
    const again = pickWord(['food'], used, rng);
    expect(TOPIC_BY_ID.food.words).toContain(again.word);
    expect(again.used.food).toHaveLength(1);
  });
});

describe('win conditions', () => {
  const mk = (roles: [string, boolean][]): GamePlayer[] =>
    roles.map(([role, alive], i) => ({ id: `${i}`, name: `${i}`, role: role as 'crew' | 'imposter', alive }));

  it('crew wins when every imposter is out', () => {
    expect(checkWinner(mk([['imposter', false], ['crew', true], ['crew', true]]))).toBe('crew');
  });

  it('imposters win once they match the crew', () => {
    expect(checkWinner(mk([['imposter', true], ['crew', true], ['crew', false]]))).toBe('imposter');
  });

  it('keeps playing otherwise', () => {
    expect(checkWinner(mk([['imposter', true], ['crew', true], ['crew', true]]))).toBeNull();
  });
});

describe('full game flow', () => {
  it('passes the device to every player, then starts the discussion timer', () => {
    let s = run(withPlayers(), [{ type: 'start', now: 0 }]);
    expect(s.phase).toBe('pass');
    for (let i = 0; i < players.length; i++) {
      expect(s.game!.revealIndex).toBe(i);
      s = run(s, [{ type: 'ready' }, { type: 'donePeeking', now: 1000 }]);
    }
    expect(s.phase).toBe('discuss');
    expect(s.game!.timer!.endsAt).toBe(61000);
  });

  it('pauses and resumes the timer without losing time', () => {
    let s = run(withPlayers(), [{ type: 'start', now: 0 }]);
    for (let i = 0; i < players.length; i++) s = run(s, [{ type: 'ready' }, { type: 'donePeeking', now: 0 }]);
    s = run(s, [{ type: 'pauseTimer', now: 20000 }]);
    expect(timeLeft(s.game!.timer!, 999999)).toBe(40000);
    s = run(s, [{ type: 'resumeTimer', now: 100000 }]);
    expect(timeLeft(s.game!.timer!, 110000)).toBe(30000);
  });

  it('has no timer when the limit is off', () => {
    let s = run(withPlayers(1, null), [{ type: 'start', now: 0 }]);
    for (let i = 0; i < players.length; i++) s = run(s, [{ type: 'ready' }, { type: 'donePeeking', now: 0 }]);
    expect(s.game!.timer).toBeNull();
  });

  it('ends with a crew win after voting out every imposter', () => {
    let s = run(withPlayers(2), [{ type: 'start', now: 0 }]);
    for (let i = 0; i < players.length; i++) s = run(s, [{ type: 'ready' }, { type: 'donePeeking', now: 0 }]);
    const imposters = s.game!.players.filter((p) => p.role === 'imposter');

    s = run(s, [{ type: 'openVote' }, { type: 'vote', id: imposters[0].id }]);
    expect(s.phase).toBe('verdict');
    expect(s.game!.winner).toBeNull();

    s = run(s, [{ type: 'continue', now: 0 }]);
    expect(s.phase).toBe('discuss');
    expect(s.game!.round).toBe(2);
    expect(turnOrder(s.game!).some((p) => p.id === imposters[0].id)).toBe(false);

    s = run(s, [{ type: 'openVote' }, { type: 'vote', id: imposters[1].id }, { type: 'continue', now: 0 }]);
    expect(s.phase).toBe('over');
    expect(s.game!.winner).toBe('crew');
  });

  it('ends with an imposter win when crew gets voted out', () => {
    let s = run(withPlayers(2), [{ type: 'start', now: 0 }]);
    for (let i = 0; i < players.length; i++) s = run(s, [{ type: 'ready' }, { type: 'donePeeking', now: 0 }]);
    const crew = s.game!.players.filter((p) => p.role === 'crew');
    s = run(s, [{ type: 'openVote' }, { type: 'vote', id: crew[0].id }]);
    expect(s.game!.winner).toBe('imposter');
  });

  it('ignores votes for players already out', () => {
    let s = run(withPlayers(2), [{ type: 'start', now: 0 }]);
    for (let i = 0; i < players.length; i++) s = run(s, [{ type: 'ready' }, { type: 'donePeeking', now: 0 }]);
    const crew = s.game!.players.find((p) => p.role === 'crew')!;
    s = { ...s, game: { ...s.game!, players: s.game!.players.map((p) => (p.id === crew.id ? { ...p, alive: false } : p)) } };
    const after = run(s, [{ type: 'openVote' }, { type: 'vote', id: crew.id }]);
    expect(after.phase).toBe('vote');
  });
});

describe('setup', () => {
  it('trims names and refuses blanks', () => {
    let s = run(DEFAULT_STATE, [{ type: 'addPlayer', id: 'a', name: '   ' }]);
    expect(s.settings.players).toHaveLength(0);
    s = run(s, [{ type: 'addPlayer', id: 'a', name: '  Mav   the  great  ' }]);
    expect(s.settings.players[0].name).toBe('Mav the great');
  });

  it('will not start without enough players or topics', () => {
    const s = run({ ...withPlayers(), settings: { ...withPlayers().settings, topicIds: [] } }, [
      { type: 'start', now: 0 },
    ]);
    expect(s.phase).toBe('setup');
  });
});
