# Mert

The imposter word game for one shared iPad. Everyone gets the secret word. Almost everyone.

## Play

1. Add players, pick topics, choose imposters and a time limit.
2. Pass the iPad around. Each player slides the glass card up to see the word, or learns they are the imposter.
3. Say one word each, in order. Vote whenever you're ready, or when the timer runs out.
4. The crew wins by catching every imposter. Imposters win once they match the crew in number.

On iPad: open the site in Safari, tap Share, then **Add to Home Screen** for a full-screen app.

## Develop

```bash
npm install
npm run dev      # local server, also reachable from an iPad on the same Wi-Fi
npm test         # game rules
npm run build    # production build in dist/
```

Stack: React, Vite, TypeScript, Motion. All game state lives on the device.
