# Multiplayer A: phones as secret cards

Everyone is in the same room. The iPad is the table: setup, timer, turn order, results. Each player's phone is their private card and their secret ballot. One-iPad pass-and-play stays as its own mode.

## Decisions

| Topic | Decision |
|---|---|
| Who plays where | Same room only; talking stays out loud |
| Voting | Secret, on each phone; the iPad reveals the result |
| Players without a phone | Mixed mode: they peek and vote on the iPad |
| Connection | Plan A: direct device-to-device (WebRTC via PeerJS, public signaling + TURN). Plan B if A fails on real networks: Firebase |
| Authority | The iPad runs the game rules (existing reducer). Phones are thin screens |
| Secrets | The iPad sends each phone only its own role. No phone ever receives the full game |

## Flow

1. iPad: **Play with phones**. Shows a 4-letter room code and a QR code.
2. Phones scan or type the code, enter a name, and appear live in the iPad lobby. Phoneless players are added on the iPad as now.
3. iPad: topics, imposters, timer, Start.
4. Phones show the slide-to-peek card. Phoneless players peek on the iPad. The iPad shows how many have checked.
5. Discussion on the iPad as now.
6. Vote: phones get a secret ballot, phoneless players vote privately on the iPad. When all votes are in, the iPad reveals who goes out. Ties: revote between the tied players; a second tie means nobody goes out this round.
7. Last chance and results on the iPad; phones show the result too.

## Milestones

Status: milestones 0 to 5 shipped together (secret ballots, ties, reconnects and mixed mode included).

| # | Milestone | Done when |
|---|---|---|
| 0 | Connection test at `#/connect` | An iPad and a phone connect on Mav's real network and buzz each other |
| 1 | Rooms: code, QR, join with name, live lobby | 5 phones join one iPad lobby |
| 2 | Private cards on phones | A full round is dealt with no iPad passing |
| 3 | Secret phone voting with ties | Votes resolve correctly, nobody sees another ballot |
| 4 | Reconnects | A phone that locks or refreshes rejoins as the same player; an iPad refresh keeps the room |
| 5 | Mixed mode | Phoneless players peek and vote on the iPad in the same game |

## Risks

- Phones that lock their screen drop the connection. Milestone 4 rejoins with a token saved on the phone.
- Some networks block direct connections. PeerJS falls back to its public relay (TURN), which is free but not guaranteed; Plan B is Firebase.
- The public PeerJS signaling server is a free community service with no uptime promise.
- Multiplayer needs internet; one-iPad mode does not.

## Message protocol (draft)

Phone to iPad: `join {name, token}`, `peeked`, `vote {targetId}`.
iPad to phone: `welcome {playerId}`, `lobby {names}`, `card {role, topic?, word?}`, `phase {name, ...public info}`, `ballot {candidates}`, `result {...}`.
