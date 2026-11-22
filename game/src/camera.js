// camera.js — wall-mounted security cameras that sweep their cone.
// A camera is blind while hacked, EMP'd, or while the thief hides in smoke.

import { CAMERA } from './config.js';
import { angleDiff, angleTo, dist, lineBlocked } from './level.js';

export function cameraAngle(cam, time) {
  return cam.baseAngle + Math.sin(time * CAMERA.sweepSpeed + cam.phase) * cam.sweep;
}

export function cameraDisabled(cam, time) {
  return time < cam.disabledUntil;
}

export function cameraSees(cam, p, game) {
  if (cameraDisabled(cam, game.time)) return false;
  if (game.smokeCovers(p.x, p.y)) return false;
  const d = dist(cam.x, cam.y, p.x, p.y);
  if (d > CAMERA.coneLength) return false;
  const want = angleTo(cam.x, cam.y, p.x, p.y);
  if (Math.abs(angleDiff(cameraAngle(cam, game.time), want)) > CAMERA.coneHalfAngle) return false;
  if (lineBlocked(cam.x, cam.y, p.x, p.y, game.walls)) return false;
  return true;
}

export function cameraDetectRate(cam, p, game) {
  if (!cameraSees(cam, p, game)) return 0;
  const d = dist(cam.x, cam.y, p.x, p.y);
  const closeness = 1 - d / (CAMERA.coneLength + 40);
  let rate = CAMERA.detectRate * (0.4 + 0.6 * Math.max(0, closeness));
  if (p.sneaking) rate *= 0.5;
  return rate;
}
