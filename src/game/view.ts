import { TOPIC_BY_ID } from '../data/topics';
import { isPhoneGame } from './logic';
import type { AppState } from './types';

/**
 * Everything one phone is allowed to know. Built on the iPad per player, so a phone
 * never receives anyone else's role or the word unless it's on their own card.
 */
export interface PhoneView {
  room: string;
  you: { id: string; name: string } | null;
  status: 'lobby' | 'dealing' | 'discuss' | 'vote' | 'verdict' | 'over';
  lobby: string[];
  card: { imposter: boolean; topic?: string; word?: string } | null;
  peeked: boolean;
  alive: boolean;
  ballot: { candidates: { id: string; name: string }[]; voted: string | null; revote: boolean } | null;
  result: { winner: 'crew' | 'imposter'; word: string; topic: string; youWon: boolean; imposters: string[] } | null;
}

export function phoneView(state: AppState, deviceId: string): PhoneView | null {
  const { settings, game, phase } = state;
  const me = settings.players.find((p) => p.deviceId === deviceId);
  const base: PhoneView = {
    room: settings.room ?? '',
    you: me ? { id: me.id, name: me.name } : null,
    status: 'lobby',
    lobby: settings.players.map((p) => p.name),
    card: null,
    peeked: false,
    alive: true,
    ballot: null,
    result: null,
  };
  if (!me) return base;
  const gp = game && isPhoneGame(game) ? game.players.find((p) => p.id === me.id) : undefined;
  if (!game || !gp || phase === 'home' || phase === 'howto' || phase === 'setup') return base;

  const imposter = gp.role === 'imposter';
  const view: PhoneView = {
    ...base,
    card: imposter ? { imposter: true } : { imposter: false, topic: TOPIC_BY_ID[game.topicId]?.name, word: game.word },
    peeked: (game.peeked ?? []).includes(gp.id),
    alive: gp.alive,
  };

  switch (phase) {
    case 'pass':
    case 'peek':
    case 'deal':
      return { ...view, status: 'dealing' };
    case 'discuss':
      return { ...view, status: 'discuss' };
    case 'vote': {
      if (!gp.alive) return { ...view, status: 'vote' };
      const candidates = (game.candidates ?? [])
        .filter((id) => id !== gp.id)
        .map((id) => ({ id, name: game.players.find((p) => p.id === id)?.name ?? '' }));
      return {
        ...view,
        status: 'vote',
        ballot: { candidates, voted: game.ballots?.[gp.id] ?? null, revote: !!game.revote },
      };
    }
    case 'verdict':
    case 'guess':
      return { ...view, status: 'verdict' };
    case 'over': {
      const winner = game.winner ?? 'crew';
      return {
        ...view,
        status: 'over',
        result: {
          winner,
          word: game.word,
          topic: TOPIC_BY_ID[game.topicId]?.name ?? '',
          youWon: gp.role === winner,
          imposters: game.players.filter((p) => p.role === 'imposter').map((p) => p.name),
        },
      };
    }
  }
}
