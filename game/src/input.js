// input.js — keyboard state and one-shot action keys.
// Holds the current key set and reports edge-triggered presses (E, Q, F,
// Space, Enter, R) exactly once per keydown so the game can act on them.

export function createInput() {
  return {
    up: false,
    down: false,
    left: false,
    right: false,
    sneak: false,
    pressed: new Set(), // action keys pressed since the last frame
  };
}

const KEYMAP = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  ShiftLeft: 'sneak',
  ShiftRight: 'sneak',
};

const ACTIONS = ['KeyE', 'KeyQ', 'KeyF', 'Space', 'Enter', 'KeyR', 'Escape', 'KeyM'];

export function attachInput(input, target) {
  target.addEventListener('keydown', (event) => {
    const held = KEYMAP[event.code];
    if (held) {
      input[held] = true;
      event.preventDefault();
    }
    if (ACTIONS.includes(event.code) && !event.repeat) {
      input.pressed.add(event.code);
      if (event.code === 'Space' || event.code.startsWith('Arrow')) event.preventDefault();
    }
  });
  target.addEventListener('keyup', (event) => {
    const held = KEYMAP[event.code];
    if (held) input[held] = false;
  });
  target.addEventListener('blur', () => {
    input.up = input.down = input.left = input.right = input.sneak = false;
  });
}

export function takePress(input, code) {
  if (input.pressed.has(code)) {
    input.pressed.delete(code);
    return true;
  }
  return false;
}

export function clearPresses(input) {
  input.pressed.clear();
}
