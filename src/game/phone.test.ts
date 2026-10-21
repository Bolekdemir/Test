import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, reducer, type Action } from './logic';
import type { AppState } from './types';
import { phoneView } from './view';

function seeded(seed = 7) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function run(state: AppState, actions: Action[], rng = seeded()): AppState {
  return actions.reduce((s, a) => reducer(s, a, rng), state);
}

/** Four phone players plus one player without a phone (mixed mode). */
function lobby(imposters = 1): AppState {
  let s: AppState = { ...DEFAULT_STATE, phase: 'setup', settings: { ...DEFAULT_STATE.settings, imposters } };
  s = run(s, [{ type: 'setPhones', on: true, room: 'ABCD' }]);
  for (const n of ['Mav', 'Defne', 'Kerem', 'Ada']) {
    s = run(s, [{ type: 'joinPlayer', id: `id-${n}`, deviceId: `dev-${n}`, name: n }]);
  }
  return run(s, [{ type: 'addPlayer', id: 'id-Elif', name: 'Elif' }]);
}

function dealt(imposters = 1): AppState {
  let s = run(lobby(imposters), [{ type: 'start', now: 0 }]);
  for (const p of s.game!.players.filter((p) => p.deviceId)) s = run(s, [{ type: 'peeked', playerId: p.id }]);
  s = run(s, [{ type: 'peekOnIpad', playerId: 'id-Elif' }, { type: 'ready' }, { type: 'donePeeking', now: 0 }]);
  return run(s, [{ type: 'startDiscussion', now: 0 }, { type: 'openVote' }]);
}

describe('joining', () => {
  it('adds phones to the lobby and recognises a returning device', () => {
    let s = lobby();
    expect(s.settings.room).toBe('ABCD');
    expect(s.settings.players.map((p) => p.name)).toEqual(['Mav', 'Defne', 'Kerem', 'Ada', 'Elif']);
    s = run(s, [{ type: 'joinPlayer', id: 'other', deviceId: 'dev-Mav', name: 'Mav' }]);
    expect(s.settings.players).toHaveLength(5);
  });

  it('refuses new phones once a game is running', () => {
    let s = run(lobby(), [{ type: 'start', now: 0 }]);
    s = run(s, [{ type: 'joinPlayer', id: 'late', deviceId: 'dev-late', name: 'Late' }]);
    expect(s.settings.players).toHaveLength(5);
  });
});

describe('dealing', () => {
  it('goes to the deal screen and tracks who has peeked, including the iPad peek', () => {
    let s = run(lobby(), [{ type: 'start', now: 0 }]);
    expect(s.phase).toBe('deal');
    s = run(s, [{ type: 'peeked', playerId: 'id-Mav' }, { type: 'peekOnIpad', playerId: 'id-Elif' }]);
    expect(s.phase).toBe('pass');
    expect(s.game!.players[s.game!.revealIndex].name).toBe('Elif');
    s = run(s, [{ type: 'ready' }, { type: 'donePeeking', now: 0 }]);
    expect(s.phase).toBe('deal');
    expect(s.game!.peeked).toEqual(['id-Mav', 'id-Elif']);
  });
});

describe('secret voting', () => {
  it('votes out the player with the most votes', () => {
    let s = dealt();
    const target = s.game!.players.find((p) => p.name === 'Kerem')!.id;
    for (const p of s.game!.players) {
      const pick = p.id === target ? 'id-Mav' : target;
      s = run(s, [{ type: 'castVote', voterId: p.id, targetId: pick }]);
    }
    expect(s.phase).toBe('verdict');
    expect(s.game!.lastEjectedId).toBe(target);
  });

  it('waits until everyone alive has voted', () => {
    let s = dealt();
    s = run(s, [{ type: 'castVote', voterId: 'id-Mav', targetId: 'id-Ada' }]);
    expect(s.phase).toBe('vote');
    expect(Object.keys(s.game!.ballots!)).toEqual(['id-Mav']);
  });

  it('rejects voting for yourself or for someone outside the ballot', () => {
    let s = dealt();
    s = run(s, [
      { type: 'castVote', voterId: 'id-Mav', targetId: 'id-Mav' },
      { type: 'castVote', voterId: 'id-Mav', targetId: 'nobody' },
    ]);
    expect(s.game!.ballots).toEqual({});
  });

  it('revotes between tied players, then sends nobody out on a second tie', () => {
    let s = dealt();
    const votes: [string, string][] = [
      ['id-Mav', 'id-Ada'],
      ['id-Defne', 'id-Ada'],
      ['id-Kerem', 'id-Elif'],
      ['id-Ada', 'id-Elif'],
      ['id-Elif', 'id-Kerem'],
    ];
    for (const [v, t] of votes) s = run(s, [{ type: 'castVote', voterId: v, targetId: t }]);
    expect(s.phase).toBe('vote');
    expect(s.game!.revote).toBe(true);
    expect(s.game!.candidates!.sort()).toEqual(['id-Ada', 'id-Elif']);

    const second: [string, string][] = [
      ['id-Mav', 'id-Ada'],
      ['id-Defne', 'id-Ada'],
      ['id-Kerem', 'id-Elif'],
      ['id-Ada', 'id-Elif'],
      ['id-Elif', 'id-Ada'],
    ];
    for (const [v, t] of second) s = run(s, [{ type: 'castVote', voterId: v, targetId: t }]);
    expect(s.phase).toBe('verdict');
    expect(s.game!.lastEjectedId).toBe('id-Ada');

    // A real second tie: 2 v 2 with one abstaining, closed by the host.
    let t = dealt();
    for (const [v, x] of votes) t = run(t, [{ type: 'castVote', voterId: v, targetId: x }]);
    t = run(t, [
      { type: 'castVote', voterId: 'id-Mav', targetId: 'id-Ada' },
      { type: 'castVote', voterId: 'id-Defne', targetId: 'id-Elif' },
      { type: 'closeVoting' },
    ]);
    expect(t.phase).toBe('verdict');
    expect(t.game!.lastEjectedId).toBeNull();
    t = run(t, [{ type: 'continue', now: 0 }]);
    expect(t.phase).toBe('discuss');
    expect(t.game!.players.every((p) => p.alive)).toBe(true);
  });
});

describe('phone views', () => {
  it('shows each phone only its own card', () => {
    const s = run(lobby(2), [{ type: 'start', now: 0 }]);
    for (const p of s.game!.players.filter((p) => p.deviceId)) {
      const view = phoneView(s, p.deviceId!)!;
      const json = JSON.stringify(view);
      expect(view.status).toBe('dealing');
      if (p.role === 'imposter') {
        expect(view.card).toEqual({ imposter: true });
        expect(json).not.toContain(s.game!.word);
      } else {
        expect(view.card!.word).toBe(s.game!.word);
      }
      // Never another player's role.
      expect(json).not.toMatch(/"role"/);
      expect(Object.keys(view)).not.toContain('players');
    }
  });

  it('gives a ballot without your own name, and hides it once you are out', () => {
    let s = dealt();
    const mine = phoneView(s, 'dev-Mav')!;
    expect(mine.ballot!.candidates.map((c) => c.name)).not.toContain('Mav');
    s = run(s, [{ type: 'castVote', voterId: 'id-Mav', targetId: 'id-Ada' }]);
    expect(phoneView(s, 'dev-Mav')!.ballot!.voted).toBe('id-Ada');
  });

  it('shows the lobby before the game starts', () => {
    const v = phoneView(lobby(), 'dev-Ada')!;
    expect(v.status).toBe('lobby');
    expect(v.card).toBeNull();
    expect(v.lobby).toContain('Elif');
  });
});
