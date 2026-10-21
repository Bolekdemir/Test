import type { PhoneView } from '../game/view';

export const PEER_PREFIX = 'mert-room-';
export const HEARTBEAT_MS = 2500;
/** No message for this long means the other side is gone. */
export const STALE_MS = 8000;

export type ToHost =
  | { t: 'join'; deviceId: string; name: string }
  | { t: 'peeked' }
  | { t: 'vote'; targetId: string }
  | { t: 'hb' };

export type ToPhone =
  | { t: 'view'; view: PhoneView }
  | { t: 'rejected'; reason: 'in-progress' | 'full' | 'removed' }
  | { t: 'hb' };

export function joinUrl(room: string): string {
  return `${location.origin}${location.pathname}#/join?room=${room}`;
}
