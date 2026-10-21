import { useEffect, useRef, useState } from 'react';
import { MAX_PLAYERS, type Action } from '../game/logic';
import type { AppState } from '../game/types';
import { phoneView } from '../game/view';
import type { RoomHost } from './host';

export type HostStatus = 'off' | 'starting' | 'ready' | 'error';

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Runs the room while "play with phones" is on: admits phones, turns their
 * messages into game actions, and pushes each phone its own view after every change.
 */
export function useRoomHost(state: AppState, dispatch: (a: Action) => void) {
  const { phones, room } = state.settings;
  const active = !!phones && !!room;
  const [online, setOnline] = useState<Set<string>>(() => new Set());
  const [status, setStatus] = useState<HostStatus>('off');
  const hostRef = useRef<RoomHost | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!active || !room) {
      setStatus('off');
      return;
    }
    let cancelled = false;
    let host: RoomHost | null = null;
    void import('./host').then(({ RoomHost }) => {
      if (cancelled) return;
      host = new RoomHost(room, {
        onStatus: (s) => setStatus(s),
        onPresence: (set) => setOnline(set),
        onJoin: (deviceId, name) => {
          const s = stateRef.current;
          const known = s.settings.players.find((p) => p.deviceId === deviceId);
          if (!known && s.game) return host?.send(deviceId, { t: 'rejected', reason: 'in-progress' });
          if (!known && s.settings.players.length >= MAX_PLAYERS) return host?.send(deviceId, { t: 'rejected', reason: 'full' });
          dispatch({ type: 'joinPlayer', id: newId(), deviceId, name });
        },
        onPeeked: (deviceId) => {
          const p = stateRef.current.settings.players.find((x) => x.deviceId === deviceId);
          if (p) dispatch({ type: 'peeked', playerId: p.id });
        },
        onVote: (deviceId, targetId) => {
          const p = stateRef.current.settings.players.find((x) => x.deviceId === deviceId);
          if (p) dispatch({ type: 'castVote', voterId: p.id, targetId });
        },
      });
      hostRef.current = host;
    });
    return () => {
      cancelled = true;
      host?.destroy();
      hostRef.current = null;
      setOnline(new Set());
    };
  }, [active, room, dispatch]);

  // Push every connected phone its own view after any change.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    for (const deviceId of online) {
      const view = phoneView(state, deviceId);
      if (view) host.send(deviceId, { t: 'view', view });
    }
  }, [state, online]);

  // A phone player removed on the iPad gets told and disconnected.
  const prevDevices = useRef<string[]>([]);
  useEffect(() => {
    const now = state.settings.players.flatMap((p) => (p.deviceId ? [p.deviceId] : []));
    for (const d of prevDevices.current) if (!now.includes(d)) hostRef.current?.kick(d);
    prevDevices.current = now;
  }, [state.settings.players]);

  return { online, status };
}
