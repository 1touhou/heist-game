[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/c/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/1touhou/heist-game/rank.svg)](https://make.fun/c/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/1touhou/heist-game/reward.svg)](https://make.fun/c/best-heist-game-20261122-0559)

# Midnight Vault — The Meridian Job

An original top-down 2D heist game. One thief, one bank, one diamond worth
$500. Slip past the guards and their vision cones, dodge the sweeping
security cameras, pick the vault lock, grab the Meridian Diamond — and get
out to the getaway van before the alarm hits 100%.

## How to play

Open `game/index.html` in a desktop browser (or run `node serve.ts` and open
http://localhost:8080). No build step, no network requests, no libraries.

- **WASD / Arrow keys** — move
- **Shift** — sneak (slower, harder to spot)
- **E** — pick the vault lock / hack the camera terminal
- **Q** — smoke bomb (2 charges: cones cannot see through smoke)
- **F** — EMP burst (1 charge: cameras dark for 10s)
- **Space** — stop the lockpick needle inside the green zone
- **M** — mute, **R** — restart after a bust or a getaway

## The job

1. Cross the lobby and the hall. Guards patrol with yellow vision cones;
   cameras sweep red cones. Being seen feeds the alarm meter.
2. At the vault door, press **E** and stop the needle in the green zone
   three times to pick the lock. A miss resets the streak and feeds the alarm.
3. Inside the vault: the **Meridian Diamond** ($500), gold bars, a sapphire.
   The hall holds two paintings and the lobby a cash stack — all optional.
4. The camera terminal in the lobby can be hacked (**E**, two clean stops)
   to black out the cameras for 15 seconds.
5. With the Diamond secured, reach the **getaway van** in the street. Your
   score is loot + a time bonus − an alarm penalty. If the alarm hits 100%,
   or a guard touches you, the job is blown.

## Layout

- `game/index.html` — page shell, loads the game
- `game/src/main.js` — bootstrap, game state, fixed-step loop
- `game/src/config.js` — tuning constants (speeds, cones, alarm, loot)
- `game/src/level.js` — the bank floor plan and geometry helpers
- `game/src/guard.js` — guard patrols, vision cones, chase
- `game/src/camera.js` — sweeping security cameras
- `game/src/player.js` — the thief: movement, pickups, smoke and EMP
- `game/src/alarm.js` — the alarm meter
- `game/src/minigame.js` — lockpick and hack timing test
- `game/src/render.js` — all canvas drawing (HUD, cones, overlays)
- `game/src/input.js` — keyboard state and one-shot action keys
- `game/src/audio.js` — synthesised WebAudio effects, no audio files
- `game/src/shots.js` — deterministic demo poses for the screenshots
- `main.ts` — hands the entry in: copies `game/` and `screenshots/` to
  `/output` and writes `/output/dossier.json`
- `screenshots/` — 4 real renders of the game in a browser

Built for the make.fun best-heist-game bounty
(`best-heist-game-20261122-0559`). MIT licensed.
