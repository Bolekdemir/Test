import { DEFAULT_STATE } from './game/logic';
import type { AppState } from './game/types';

const KEY = 'mert:v1';

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const saved = JSON.parse(raw) as Partial<AppState>;
    if (!saved.settings || !Array.isArray(saved.settings.players)) return DEFAULT_STATE;
    const state: AppState = {
      ...DEFAULT_STATE,
      ...saved,
      settings: { ...DEFAULT_STATE.settings, ...saved.settings },
      used: saved.used ?? {},
    };
    // A mid-game reload resumes the game; anything else opens on home.
    if (!state.game) return { ...state, phase: 'home' };
    // Never reopen straight onto someone's secret.
    if (state.phase === 'peek') return { ...state, phase: 'pass' };
    return state;
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode); the game still works in memory.
  }
}
