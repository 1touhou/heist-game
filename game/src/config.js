// config.js — tuning constants for Midnight Vault: The Meridian Job.
// One place for every number the rest of the game balances against.

export const VIEW_W = 1280;
export const VIEW_H = 720;

export const PLAYER = {
  radius: 14,
  walkSpeed: 170, // px per second
  sneakSpeed: 95,
  catchRadius: 30, // a guard this close catches the thief outright
};

export const GUARD = {
  radius: 15,
  patrolSpeed: 62,
  chaseSpeed: 118,
  coneLength: 175,
  coneHalfAngle: 0.56, // radians, about 32 degrees each side
  detectRate: 34, // alarm points per second at point-blank range
  chaseAlarm: 55, // alarm level at which guards start chasing
};

export const CAMERA = {
  coneLength: 225,
  coneHalfAngle: 0.44,
  detectRate: 13,
  sweepSpeed: 0.55, // radians per second
};

export const ALARM = {
  max: 100,
  decayPerSecond: 3.5,
  lockpickFail: 9,
  hackFail: 6,
};

export const TOOLS = {
  smokeCharges: 2,
  smokeRadius: 95,
  smokeSeconds: 6,
  empCharges: 1,
  empSeconds: 10,
  hackDisableSeconds: 15,
};

export const LOOT_VALUES = {
  diamond: 500,
  goldBar: 150,
  gem: 200,
  painting: 100,
  cash: 80,
};

export const WIN_BONUS_BASE = 2000;
export const WIN_BONUS_PER_SECOND = 8;

export const PALETTE = {
  floor: '#171c26',
  floorTile: '#1b212e',
  carpet: '#3d1620',
  carpetEdge: '#57202c',
  street: '#101318',
  wall: '#2c3444',
  wallTop: '#46536b',
  door: '#6b5a2e',
  doorLocked: '#8a6d2f',
  lootGold: '#f2c14e',
  lootGem: '#7fe3ff',
  lootDiamond: '#b8f1ff',
  guardCone: 'rgba(255, 214, 90, 0.20)',
  guardConeEdge: 'rgba(255, 214, 90, 0.55)',
  cameraCone: 'rgba(255, 84, 84, 0.18)',
  cameraConeEdge: 'rgba(255, 84, 84, 0.5)',
  player: '#e8e4d8',
  playerCloak: '#2e4a6b',
  smoke: 'rgba(180, 190, 205, 0.35)',
  van: '#c94f3d',
  hudBg: 'rgba(10, 12, 18, 0.82)',
  alarmLow: '#7fd08a',
  alarmMid: '#f2c14e',
  alarmHigh: '#ff5454',
};
