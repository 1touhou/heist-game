// render.js — every pixel of Midnight Vault, drawn on one canvas.
// The draw order is fixed: floor, loot and props, vision cones, actors,
// smoke, then the HUD and the screen overlays. Nothing is loaded from the
// network: every shape is canvas code.

import { PALETTE, VIEW_W, VIEW_H } from './config.js';
import { cameraAngle, cameraDisabled } from './camera.js';
import { GUARD } from './config.js';

export function drawGame(ctx, game) {
  drawFloor(ctx, game);
  drawLoot(ctx, game);
  drawTerminal(ctx, game);
  drawVan(ctx, game);
  drawCones(ctx, game);
  drawGuards(ctx, game);
  drawCameras(ctx, game);
  drawPlayer(ctx, game);
  drawSmoke(ctx, game);
  drawHud(ctx, game);
  drawOverlays(ctx, game);
}

function drawFloor(ctx, game) {
  ctx.fillStyle = PALETTE.floor;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // Tile grid.
  ctx.strokeStyle = PALETTE.floorTile;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 32; x < VIEW_W; x += 64) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 660);
  }
  for (let y = 32; y < 660; y += 64) {
    ctx.moveTo(0, y);
    ctx.lineTo(VIEW_W, y);
  }
  ctx.stroke();
  // Vault carpet.
  ctx.fillStyle = PALETTE.carpet;
  ctx.fillRect(416, 16, 448, 234);
  ctx.strokeStyle = PALETTE.carpetEdge;
  ctx.lineWidth = 3;
  ctx.strokeRect(416, 16, 448, 234);
  // Street strip along the bottom.
  ctx.fillStyle = PALETTE.street;
  ctx.fillRect(0, 676, VIEW_W, 44);
  ctx.strokeStyle = '#2a2f3a';
  ctx.setLineDash([18, 14]);
  ctx.beginPath();
  ctx.moveTo(0, 698);
  ctx.lineTo(VIEW_W, 698);
  ctx.stroke();
  ctx.setLineDash([]);
  // Walls.
  for (const w of game.walls) {
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = PALETTE.wallTop;
    ctx.fillRect(w.x, w.y, w.w, 3);
  }
  // Vault door (or the open gap once picked).
  const d = game.vaultDoor;
  if (!d.open) {
    ctx.fillStyle = d.locked ? PALETTE.doorLocked : PALETTE.door;
    ctx.fillRect(d.x, d.y, d.w, d.h);
    ctx.fillStyle = '#2b2413';
    ctx.beginPath();
    ctx.arc(d.x + d.w / 2, d.y + d.h / 2, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2c14e';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VAULT', d.x + d.w / 2, d.y - 8);
  } else {
    ctx.fillStyle = '#0c0f16';
    ctx.fillRect(d.x, d.y, d.w, d.h);
  }
  // Room labels.
  ctx.fillStyle = 'rgba(232, 228, 216, 0.4)';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('V A U L T', 432, 44);
  ctx.fillText('H A L L', 24, 300);
  ctx.fillText('L O B B Y', 24, 700 - 24);
}

function drawLoot(ctx, game) {
  const t = game.time;
  for (const item of game.loot) {
    if (item.taken) continue;
    const pulse = 0.65 + 0.35 * Math.sin(t * 3 + item.x);
    if (item.kind === 'diamond') {
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = PALETTE.lootDiamond;
      ctx.globalAlpha = pulse;
      ctx.fillRect(-11, -11, 22, 22);
      ctx.restore();
      ctx.globalAlpha = 1;
      label(ctx, '◆ DIAMOND', item.x, item.y - 26, '#b8f1ff');
    } else if (item.kind === 'gold') {
      ctx.fillStyle = PALETTE.lootGold;
      ctx.globalAlpha = pulse;
      ctx.fillRect(item.x - 12, item.y - 6, 24, 12);
      ctx.globalAlpha = 1;
    } else if (item.kind === 'gem') {
      ctx.fillStyle = PALETTE.lootGem;
      ctx.globalAlpha = pulse;
      ctx.beginPath();
      ctx.arc(item.x, item.y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (item.kind === 'painting') {
      ctx.fillStyle = '#8a6d3b';
      ctx.fillRect(item.x - 18, item.y - 12, 36, 24);
      ctx.fillStyle = '#c9a86a';
      ctx.fillRect(item.x - 14, item.y - 8, 28, 16);
      label(ctx, 'PAINTING', item.x, item.y - 18, '#c9a86a');
    } else if (item.kind === 'cash') {
      ctx.fillStyle = '#7fc97f';
      ctx.globalAlpha = pulse;
      ctx.fillRect(item.x - 13, item.y - 7, 26, 14);
      ctx.globalAlpha = 1;
    }
  }
}

function label(ctx, text, x, y, color) {
  ctx.fillStyle = color;
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
}

function drawTerminal(ctx, game) {
  const t = game.terminal;
  ctx.fillStyle = '#1d2b3a';
  ctx.fillRect(t.x, t.y, t.w, t.h);
  ctx.fillStyle = '#39d0ba';
  ctx.fillRect(t.x + 6, t.y + 6, t.w - 12, 12);
  label(ctx, 'HACK [E]', t.x + t.w / 2, t.y + t.h + 12, '#39d0ba');
}

function drawVan(ctx, game) {
  const v = game.van;
  ctx.fillStyle = PALETTE.van;
  ctx.fillRect(v.x, v.y, v.w, v.h);
  ctx.fillStyle = '#e8e4d8';
  ctx.fillRect(v.x + 52, v.y + 6, 22, 32);
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(v.x + 16, v.y + v.h, 8, 0, Math.PI * 2);
  ctx.arc(v.x + 64, v.y + v.h, 8, 0, Math.PI * 2);
  ctx.fill();
  label(ctx, 'GETAWAY VAN', v.x + v.w / 2, v.y - 8, '#e8e4d8');
  // Escape marker.
  if (game.hasDiamond) {
    ctx.strokeStyle = '#7fd08a';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(v.x - 12, v.y - 34, v.w + 24, v.h + 40);
    ctx.setLineDash([]);
  }
}

function drawCone(ctx, x, y, angle, length, halfAngle, fill, edge) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, length, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawCones(ctx, game) {
  for (const cam of game.cameras) {
    if (cameraDisabled(cam, game.time)) continue;
    drawCone(ctx, cam.x, cam.y, cameraAngle(cam, game.time), 225, 0.44, PALETTE.cameraCone, PALETTE.cameraConeEdge);
  }
  for (const g of game.guards) {
    drawCone(ctx, g.x, g.y, g.angle, GUARD.coneLength, GUARD.coneHalfAngle, PALETTE.guardCone, PALETTE.guardConeEdge);
  }
}

function drawGuards(ctx, game) {
  for (const g of game.guards) {
    ctx.fillStyle = g.mode === 'chase' ? '#ff6b5e' : g.mode === 'suspicious' ? '#f2c14e' : '#3f6ea5';
    ctx.beginPath();
    ctx.arc(g.x, g.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0e1118';
    ctx.beginPath();
    ctx.arc(g.x + Math.cos(g.angle) * 6, g.y + Math.sin(g.angle) * 6, 6, 0, Math.PI * 2);
    ctx.fill();
    // Cap brim shows facing.
    ctx.strokeStyle = '#e8e4d8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    ctx.lineTo(g.x + Math.cos(g.angle) * 20, g.y + Math.sin(g.angle) * 20);
    ctx.stroke();
    label(ctx, g.mode === 'chase' ? '!' : g.mode === 'suspicious' ? '?' : '', g.x, g.y - 22, g.mode === 'chase' ? '#ff6b5e' : '#f2c14e');
  }
}

function drawCameras(ctx, game) {
  for (const cam of game.cameras) {
    const off = cameraDisabled(cam, game.time);
    ctx.fillStyle = off ? '#3a4150' : '#c94f3d';
    ctx.fillRect(cam.x - 8, cam.y - 8, 16, 16);
    ctx.fillStyle = off ? '#555' : '#ff5454';
    ctx.beginPath();
    ctx.arc(cam.x, cam.y, 3.5, 0, Math.PI * 2);
    ctx.fill();
    if (off) label(ctx, 'OFF', cam.x, cam.y - 14, '#7fd08a');
  }
}

function drawPlayer(ctx, game) {
  const p = game.player;
  ctx.save();
  ctx.translate(p.x, p.y);
  // Cloak.
  ctx.fillStyle = PALETTE.playerCloak;
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(13, 12);
  ctx.lineTo(-13, 12);
  ctx.closePath();
  ctx.fill();
  // Hooded head.
  ctx.fillStyle = PALETTE.player;
  ctx.beginPath();
  ctx.arc(0, -4, 9, 0, Math.PI * 2);
  ctx.fill();
  // Facing tick.
  ctx.strokeStyle = PALETTE.player;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.lineTo(Math.cos(p.angle) * 15, -4 + Math.sin(p.angle) * 15);
  ctx.stroke();
  ctx.restore();
  if (p.sneaking) label(ctx, 'SNEAKING', p.x, p.y - 26, '#9fb4d8');
}

function drawSmoke(ctx, game) {
  for (const s of game.smoke) {
    if (game.time >= s.until) continue;
    const fade = Math.min(1, (s.until - game.time) / 1.5);
    ctx.fillStyle = `rgba(180, 190, 205, ${0.32 * fade})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 95, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s.x - 40, s.y + 18, 55, 0, Math.PI * 2);
    ctx.arc(s.x + 42, s.y - 14, 60, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHud(ctx, game) {
  // Top bar.
  ctx.fillStyle = PALETTE.hudBg;
  ctx.fillRect(0, 0, VIEW_W, 34);
  ctx.fillStyle = '#e8e4d8';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`LOOT  $${game.lootValue}`, 14, 22);
  ctx.fillText(`TIME  ${formatTime(game.time)}`, 180, 22);
  ctx.fillText(`SMOKE ×${game.player.smokeLeft}  [Q]`, 330, 22);
  ctx.fillText(`EMP ×${game.player.empLeft}  [F]`, 470, 22);
  // Alarm meter.
  const ax = 640;
  const aw = 300;
  ctx.fillStyle = '#222';
  ctx.fillRect(ax, 10, aw, 14);
  const frac = game.alarm / 100;
  ctx.fillStyle = game.alarm < 40 ? PALETTE.alarmLow : game.alarm < 75 ? PALETTE.alarmMid : PALETTE.alarmHigh;
  ctx.fillRect(ax, 10, aw * frac, 14);
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1;
  ctx.strokeRect(ax, 10, aw, 14);
  ctx.fillStyle = '#e8e4d8';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`ALARM ${Math.round(game.alarm)}%`, ax + aw + 10, 22);
  // Objective line.
  ctx.textAlign = 'right';
  ctx.fillStyle = game.hasDiamond ? '#7fd08a' : '#f2c14e';
  ctx.fillText(game.hasDiamond ? 'ESCAPE TO THE VAN!' : 'STEAL THE MERIDIAN DIAMOND', VIEW_W - 14, 22);
  // Context prompt.
  if (game.mode === 'play') {
    let prompt = '';
    if (!game.vaultDoor.open && game.nearVaultDoor) prompt = 'Press E to pick the vault lock';
    else if (game.nearTerminal) prompt = 'Press E to hack the cameras';
    else if (game.nearLoot) prompt = 'Walk over loot to grab it';
    if (prompt) {
      ctx.fillStyle = 'rgba(10,12,18,0.8)';
      const w = ctx.measureText(prompt).width + 24;
      ctx.fillRect((VIEW_W - w) / 2, VIEW_H - 40, w, 26);
      ctx.fillStyle = '#f2c14e';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(prompt, VIEW_W / 2, VIEW_H - 22);
    }
  }
  // Toast message.
  if (game.message && game.time < game.messageUntil) {
    ctx.fillStyle = 'rgba(10,12,18,0.85)';
    const w = ctx.measureText(game.message).width + 28;
    ctx.fillRect((VIEW_W - w) / 2, 44, w, 26);
    ctx.fillStyle = '#e8e4d8';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(game.message, VIEW_W / 2, 62);
  }
  // Spotted warning.
  if (game.alarmRising && game.mode === 'play') {
    ctx.fillStyle = '#ff5454';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPOTTED!', VIEW_W / 2, 100);
  }
}

function formatTime(t) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function drawOverlays(ctx, game) {
  if (game.mode === 'title') drawTitle(ctx, game);
  else if (game.mode === 'minigame') drawMinigame(ctx, game);
  else if (game.mode === 'busted') drawEnd(ctx, game, false);
  else if (game.mode === 'win') drawEnd(ctx, game, true);
}

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(8, 10, 15, 0.88)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#f2c14e';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
}

function drawTitle(ctx) {
  ctx.fillStyle = 'rgba(5, 7, 11, 0.72)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  panel(ctx, 290, 130, 700, 440);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f2c14e';
  ctx.font = 'bold 44px sans-serif';
  ctx.fillText('MIDNIGHT VAULT', VIEW_W / 2, 200);
  ctx.fillStyle = '#b8f1ff';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('— The Meridian Job —', VIEW_W / 2, 234);
  ctx.fillStyle = '#e8e4d8';
  ctx.font = '16px sans-serif';
  const lines = [
    'One thief. One bank. One diamond worth $500.',
    'Slip past the guards and their vision cones, dodge the',
    'sweeping cameras, pick the vault lock and get out to the van.',
    '',
    'WASD / Arrows — move      Shift — sneak (harder to spot)',
    'E — pick lock / hack terminal      Q — smoke bomb      F — EMP',
    'Grab the Meridian Diamond, then reach the getaway van.',
    'If the alarm hits 100%, the job is blown.',
  ];
  lines.forEach((line, i) => ctx.fillText(line, VIEW_W / 2, 280 + i * 26));
  ctx.fillStyle = '#7fd08a';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('Press ENTER to start the heist', VIEW_W / 2, 530);
}

function drawMinigame(ctx, game) {
  const mg = game.minigame;
  if (!mg) return;
  ctx.fillStyle = 'rgba(5, 7, 11, 0.6)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  panel(ctx, 340, 250, 600, 210);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f2c14e';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(mg.kind === 'lockpick' ? 'PICK THE VAULT LOCK' : 'HACK THE CAMERAS', VIEW_W / 2, 292);
  ctx.fillStyle = '#e8e4d8';
  ctx.font = '15px sans-serif';
  ctx.fillText('Press SPACE when the needle is inside the green zone', VIEW_W / 2, 320);
  ctx.fillText(`Clean stops: ${mg.hits} / ${mg.needed}   (a miss resets the streak and feeds the alarm)`, VIEW_W / 2, 342);
  // Bar.
  const bx = 400;
  const bw = 480;
  const by = 380;
  ctx.fillStyle = '#1d2330';
  ctx.fillRect(bx, by, bw, 26);
  ctx.fillStyle = '#3fae5a';
  ctx.fillRect(bx + mg.zoneStart * bw, by, (mg.zoneEnd - mg.zoneStart) * bw, 26);
  ctx.strokeStyle = '#888';
  ctx.strokeRect(bx, by, bw, 26);
  // Needle.
  const nx = bx + mg.needle * bw;
  ctx.fillStyle = '#fff';
  ctx.fillRect(nx - 2, by - 8, 4, 42);
  ctx.fillStyle = '#9fb4d8';
  ctx.font = '13px sans-serif';
  ctx.fillText('SPACE to stop  •  ESC to walk away', VIEW_W / 2, 438);
}

function drawEnd(ctx, game, won) {
  ctx.fillStyle = won ? 'rgba(6, 20, 10, 0.78)' : 'rgba(25, 5, 5, 0.78)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  panel(ctx, 340, 190, 600, 330);
  ctx.textAlign = 'center';
  if (won) {
    ctx.fillStyle = '#7fd08a';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText('CLEAN GETAWAY!', VIEW_W / 2, 252);
    ctx.fillStyle = '#e8e4d8';
    ctx.font = '18px sans-serif';
    ctx.fillText(`Loot grabbed: $${game.lootValue}`, VIEW_W / 2, 300);
    ctx.fillText(`Time bonus: $${game.winBonus}`, VIEW_W / 2, 328);
    ctx.fillText(`Alarm penalty: -$${game.alarmPenalty}`, VIEW_W / 2, 356);
    ctx.fillStyle = '#f2c14e';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`FINAL SCORE  $${game.finalScore}`, VIEW_W / 2, 404);
    ctx.fillStyle = '#e8e4d8';
    ctx.font = '16px sans-serif';
    ctx.fillText('The Meridian Diamond is yours. Press R to run it again.', VIEW_W / 2, 452);
  } else {
    ctx.fillStyle = '#ff5454';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText('BUSTED!', VIEW_W / 2, 252);
    ctx.fillStyle = '#e8e4d8';
    ctx.font = '18px sans-serif';
    const why = game.caughtBy ? `Caught by the ${game.caughtBy}.` : 'The alarm hit 100% — the bank locked down.';
    ctx.fillText(why, VIEW_W / 2, 300);
    ctx.fillText(`Loot grabbed before the bust: $${game.lootValue}`, VIEW_W / 2, 336);
    ctx.fillStyle = '#f2c14e';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Press R to try the job again', VIEW_W / 2, 404);
  }
}
