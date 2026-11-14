import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialSimulation,
  getComboMultiplier,
  getDifficultyParams,
  spawnEntity,
  stepSimulation,
} from './engine';
import { InputState, MAX_HEARTS, TOTAL_SCROLL_GOAL } from './types';

const NO_INPUT: InputState = {
  left: false,
  right: false,
  dashJustPressed: false,
  pointerTargetX: null,
};

test('game survives opening seconds with zero input without taking damage', () => {
  const sim = createInitialSimulation();
  for (let i = 0; i < 180; i++) {
    stepSimulation(sim, NO_INPUT, 1 / 60, () => 0.5);
  }
  assert.equal(sim.outcome, 'playing');
  assert.equal(sim.hearts, MAX_HEARTS);
});

test('combo multiplier scales cleanly at thresholds', () => {
  assert.equal(getComboMultiplier(0), 1);
  assert.equal(getComboMultiplier(2), 1);
  assert.equal(getComboMultiplier(3), 2);
  assert.equal(getComboMultiplier(7), 3);
  assert.equal(getComboMultiplier(12), 4);
});

test('collecting 6 celebration scrolls triggers victory and unlocks all blessings', () => {
  const sim = createInitialSimulation();
  for (let i = 0; i < TOTAL_SCROLL_GOAL; i++) {
    const scroll = spawnEntity(sim, 'scroll', () => 0.5);
    scroll.baseX = sim.player.x;
    scroll.swayAmp = 0;
    scroll.x = sim.player.x;
    scroll.y = sim.player.y;
    sim.hitstopTimer = 0;
    const events = stepSimulation(sim, NO_INPUT, 1 / 60, () => 0.5);
    assert.ok(events.some((e) => e.type === 'catch_scroll'));
    if (i < TOTAL_SCROLL_GOAL - 1) {
      assert.equal(sim.outcome, 'playing');
    } else {
      assert.equal(sim.outcome, 'victory');
      assert.ok(events.some((e) => e.type === 'victory'));
    }
  }
  assert.equal(sim.scrollsCollected, TOTAL_SCROLL_GOAL);
  assert.equal(sim.unlockedIds.length, TOTAL_SCROLL_GOAL);
});

test('losing all hearts triggers defeat after brief beat', () => {
  const sim = createInitialSimulation();
  for (let i = 0; i < MAX_HEARTS; i++) {
    sim.player.invulnTimer = 0;
    sim.hitstopTimer = 0;
    const hazard = spawnEntity(sim, 'inkblot', () => 0.5);
    hazard.baseX = sim.player.x;
    hazard.x = sim.player.x;
    hazard.y = sim.player.y;
    stepSimulation(sim, NO_INPUT, 1 / 60, () => 0.5);
  }
  assert.equal(sim.hearts, 0);
  // Advance past hitstop + 0.48s end beat
  for (let i = 0; i < 45; i++) {
    stepSimulation(sim, NO_INPUT, 1 / 60, () => 0.5);
  }
  assert.equal(sim.outcome, 'defeat');
});

test('feather dash grants temporary invulnerability and starts cooldown', () => {
  const sim = createInitialSimulation();
  const dashInput: InputState = {
    left: false,
    right: true,
    dashJustPressed: true,
    pointerTargetX: null,
  };
  const events = stepSimulation(sim, dashInput, 1 / 60, () => 0.5);
  assert.ok(events.some((e) => e.type === 'dash'));
  assert.ok(sim.player.invulnTimer > 0.2);
  assert.ok(sim.player.dashCooldown > 1.0);

  // Hazard contact during dash invulnerability should not damage Pip
  const hazard = spawnEntity(sim, 'inkblot', () => 0.5);
  hazard.x = sim.player.x;
  hazard.y = sim.player.y;
  stepSimulation(sim, NO_INPUT, 1 / 60, () => 0.5);
  assert.equal(sim.hearts, MAX_HEARTS);
});

test('rogue quill spawns with telegraph timer before descending', () => {
  const sim = createInitialSimulation();
  const quill = spawnEntity(sim, 'quill', () => 0.5);
  const startY = quill.y;
  assert.ok(quill.telegraphTimer > 0.4);

  stepSimulation(sim, NO_INPUT, 0.05, () => 0.5);
  assert.equal(quill.y, startY);

  // Advance beyond telegraph
  for (let i = 0; i < 15; i++) {
    stepSimulation(sim, NO_INPUT, 0.05, () => 0.5);
  }
  assert.ok(quill.y > startY);
});

test('difficulty scales across elapsed time and chapters', () => {
  const early = getDifficultyParams(2, 1);
  const mid = getDifficultyParams(30, 2);
  const late = getDifficultyParams(65, 3);
  assert.equal(early.hazardChance, 0);
  assert.ok(mid.hazardChance > 0);
  assert.ok(late.speedScale > mid.speedScale);
  assert.ok(late.spawnInterval < early.spawnInterval);
});
