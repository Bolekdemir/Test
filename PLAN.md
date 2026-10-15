# Imposter — Game Plan

A pass-and-play party game for one iPad. Everyone except the imposter(s) knows the secret word. Players take turns saying one related word out loud, then vote out who they think the imposter is.

## Locked decisions

| Topic | Decision |
|---|---|
| Play mode | Pass-and-play on one device (no online multiplayer in v1) |
| Imposter info | Knows nothing: no word, no category |
| Imposter last guess | None: getting voted out ends that imposter |
| Language | English only |
| Platform | Installable web app (PWA), iPad-first |
| Name | Mert |
| Timer | One countdown for the whole discussion; vote any time |
| Topics | 26 topics, pick several or mix everything |
| Look | Apple-like, sage palette + cream + white (see DESIGN.md) |

## Game flow

```
Setup → Reveal (pass device) → Word rounds → Vote → Vote result ─┬→ Game over
                                   ↑                             │
                                   └──── game not over ──────────┘
```

1. **Setup** — add/remove/reorder players (names persist between games), choose imposter count, choose categories, optional turn timer.
2. **Reveal** — for each player: "Pass to **Name**" → *press and hold* to see role → release hides it → "Done, pass on". Crew sees `Category · WORD`; imposter sees `You are the IMPOSTER`. No back button.
3. **Word rounds** — app shows a random starting player and turn order (skips eliminated players). Optional countdown per turn. Players speak out loud; app just tracks whose turn it is. "Go to vote" is available at any time.
4. **Vote** — group agrees out loud, taps one player, confirms. "Skip vote" also allowed.
5. **Vote result** — dramatic reveal: "Mav was an IMPOSTER" / "Mav was NOT the imposter".
6. **Game over** — when a win condition hits. Shows the word, all imposters, and "Play again" (same players, new word, new roles).

## Rules

- **Players:** 3–20.
- **Imposters:** 1 to `floor((players - 1) / 2)` so crew always starts as the majority. Suggested default: `max(1, round(players / 5))`.
- **Imposters don't know each other.**
- **Crew wins:** every imposter has been voted out.
- **Imposters win:** remaining imposters ≥ remaining crew.
- **Word picking:** random from selected categories, never repeats until that pool is exhausted (history saved on device).

## Screens

| Screen | Key elements |
|---|---|
| Home | Play, How to play, Settings |
| Setup | Player list (add/rename/delete/drag), imposter stepper, category chips, timer toggle, Start |
| Pass | Big "Pass to {name}", Ready button |
| Reveal | Hold-to-reveal card, release to hide, Done |
| Rounds | Current speaker (large), turn order, timer, Next, Go to vote |
| Vote | Grid of alive players, confirm dialog, Skip |
| Result | Ejected player + whether imposter, Continue |
| Game over | Winner, word, imposters list, Play again / New setup |
| How to play | Short rules |

Every in-game screen has a small "⋯" menu: *End game* (confirm first).

## iPad / UX details

- **Anti-peek:** hold-to-reveal; role hidden the instant the finger lifts; no way to navigate back to a previous player's reveal.
- **Single URL, no routing** — Safari's swipe-back gesture can't leak a previous screen.
- **Survive accidents:** full game state saved to `localStorage` after every action; reopening the app resumes the game.
- **Keep screen awake** during a game via the Screen Wake Lock API where supported (silently skipped if not).
- Big tap targets (≥ 48px), large type, portrait + landscape, dark theme by default, respects safe areas.
- Haptics aren't available to web apps on iOS — use short sounds/animations instead (mutable).

## Data model

```ts
type Role = 'crew' | 'imposter';
type Phase = 'setup' | 'pass' | 'reveal' | 'rounds' | 'vote' | 'result' | 'gameOver';

interface Player { id: string; name: string }

interface Settings {
  imposterCount: number;
  categoryIds: string[];
  turnSeconds: number | null;   // null = no timer
}

interface GamePlayer extends Player { role: Role; alive: boolean }

interface GameState {
  phase: Phase;
  players: GamePlayer[];
  word: string;
  categoryId: string;
  revealIndex: number;          // whose turn to view their role
  turnOrder: string[];          // player ids, rotated to random start
  turnIndex: number;
  lastEjectedId: string | null; // null after a skipped vote
  winner: Role | null;
}
```

## Architecture

```
src/
  game/        pure TypeScript, no React — reducer, role assignment,
               win checks, word picker (fully unit tested)
  data/        words.ts — categories + word lists
  screens/     one component per phase
  components/  Button, Card, HoldToReveal, Stepper, Dialog…
  storage.ts   load/save state + settings + word history
  App.tsx      picks screen from state.phase
```

- **Stack:** React + Vite + TypeScript, plain CSS (CSS variables).
- **State:** one `useReducer` over `GameState`; reducer is pure, so rules are testable without UI. Randomness injected so tests are deterministic.
- **PWA:** `vite-plugin-pwa` for manifest, icons and offline caching.
- **Tests:** Vitest for game logic; one Playwright run on an iPad viewport walking through a full game.

## Word lists (v1)

8 categories × ~50 words: Food, Animals, Places, Jobs, Sports, Objects, Movies & TV, Things at school.
Rules for words: concrete, widely known, one or two words, not too close to another word in the same list (no "cat" + "kitten").

## Milestones

1. ✅ **Playable core** (done) — setup, pass/reveal, rounds (no timer), vote, result, game over, one category. Logic unit tested.
   *Done when:* a full 5-player, 2-imposter game can be played start to finish on an iPad.
2. **Content & polish** — all categories, category picker, timer, resume-after-refresh, wake lock, animations, How to play.
3. **Ship it** — PWA install + offline, icons, deploy to free hosting, iPad e2e test.
4. **Later ideas** — custom word lists, scoreboard across games, random imposter count, sounds, online multiplayer.

## Hosting

Free static hosting: GitHub Pages (needs a public repo on the free plan), Netlify, or Vercel. Decide at milestone 3.

## Open questions

- App name + look (colors / vibe)?
- Reveal whether an ejected player was the imposter? (Plan assumes **yes**.)
- Default turn timer length — or off by default? (Plan assumes **off**.)
