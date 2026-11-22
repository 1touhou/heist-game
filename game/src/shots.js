// shots.js — deterministic demo states for the entry's screenshots.
// Each shot poses the live game (same code, same draw path) at a moment
// worth showing: the title, a mid-heist crossing, the vault lockpick, a
// high-alarm chase, and the getaway. Used with ?shot=<name>&seed=<n>.
// Nothing here changes how the game plays; it only sets the state.

export function applyShot(game, name) {
  const p = game.player;
  if (name === 'start') {
    game.mode = 'title';
    return;
  }
  game.mode = 'play';
  game.frozen = true;
  if (name === 'cover') {
    // Mid-heist: thief crossing the hall between two cones, loot in reach.
    p.x = 560;
    p.y = 400;
    p.angle = Math.PI / 4;
    game.guards[0].x = 420;
    game.guards[0].y = 500;
    game.guards[0].angle = Math.PI;
    game.guards[1].x = 760;
    game.guards[1].y = 360;
    game.guards[1].angle = 0;
    game.guards[2].x = 700;
    game.guards[2].y = 150;
    game.guards[2].angle = Math.PI / 2;
    game.cameras[0].phase = 0.4;
    game.time = 62;
    game.alarm = 34;
    game.alarmRising = true;
    game.lootValue = 180;
    game.loot.find((i) => i.id === 'paint1').taken = true;
    game.loot.find((i) => i.id === 'cash').taken = true;
    game.message = 'Grabbed Oil painting (+$100)';
    game.messageUntil = game.time + 5;
  } else if (name === 'vault') {
    // At the vault door, lockpick minigame open, one clean stop banked.
    p.x = 640;
    p.y = 300;
    p.angle = -Math.PI / 2;
    game.guards[2].x = 800;
    game.guards[2].y = 150;
    game.guards[2].angle = Math.PI;
    game.time = 118;
    game.alarm = 22;
    game.lootValue = 260;
    game.loot.find((i) => i.id === 'paint1').taken = true;
    game.loot.find((i) => i.id === 'paint2').taken = true;
    game.loot.find((i) => i.id === 'gold3').taken = true;
    game.minigame = {
      kind: 'lockpick',
      needle: 0.44,
      speed: 1.9,
      hits: 1,
      needed: 3,
      zoneStart: 0.3,
      zoneEnd: 0.58,
    };
    game.mode = 'minigame';
  } else if (name === 'alarm') {
    // High alarm: a guard chasing through the lobby, smoke just thrown.
    p.x = 640;
    p.y = 560;
    p.angle = -Math.PI / 2;
    p.smokeLeft = 1;
    game.guards[0].x = 640;
    game.guards[0].y = 640;
    game.guards[0].angle = -Math.PI / 2;
    game.guards[0].mode = 'chase';
    game.guards[1].x = 900;
    game.guards[1].y = 360;
    game.guards[1].angle = Math.PI;
    game.guards[1].mode = 'suspicious';
    game.time = 155;
    game.alarm = 78;
    game.alarmRising = true;
    game.lootValue = 760;
    game.hasDiamond = true;
    game.loot.find((i) => i.id === 'diamond').taken = true;
    game.loot.find((i) => i.id === 'gold1').taken = true;
    game.loot.find((i) => i.id === 'gold2').taken = true;
    game.smoke = [{ x: 640, y: 580, until: game.time + 5 }];
    game.message = 'Smoke out — their cones cannot see through it';
    game.messageUntil = game.time + 5;
  } else if (name === 'escape') {
    // The getaway: diamond secured, thief at the van, score tallied.
    p.x = 640;
    p.y = 676;
    p.angle = Math.PI / 2;
    game.time = 184;
    game.alarm = 41;
    game.lootValue = 930;
    game.hasDiamond = true;
    for (const item of game.loot) {
      if (['diamond', 'gold1', 'gold2', 'gold3', 'gem'].includes(item.id)) item.taken = true;
    }
    game.vaultDoor.locked = false;
    game.vaultDoor.open = true;
    game.winBonus = 2000 - Math.floor(184 * 8);
    game.alarmPenalty = Math.floor(41 * 2);
    game.finalScore = game.lootValue + game.winBonus - game.alarmPenalty;
    game.mode = 'win';
  }
}
