import {
  FallingEntity,
  FallingKind,
  HudSnapshot,
  InputState,
  MAX_HEARTS,
  PLAYER_Y,
  SimEvent,
  SimulationState,
  TOTAL_SCROLL_GOAL,
  TRIBUTE_BLESSINGS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from './types';

const PLAYER_ACCEL = 2650;
const PLAYER_FRICTION = 10.5;
const PLAYER_MAX_SPEED = 490;
const DASH_DURATION = 0.22;
const DASH_SPEED = 940;
const DASH_COOLDOWN = 1.65;
const COMBO_WINDOW = 3.4;
const GRACE_OPENING_SECONDS = 7.5;

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function createInitialSimulation(
  bestScore = 0,
  endless = false
): SimulationState {
  return {
    elapsed: 0,
    score: 0,
    bestScore,
    hearts: MAX_HEARTS,
    combo: 0,
    bestCombo: 0,
    comboTimer: 0,
    scrollsCollected: 0,
    unlockedIds: [],
    chapter: 1,
    endless,
    outcome: 'playing',
    endBeatTimer: 0,
    hitstopTimer: 0,
    shakeTrauma: 0,
    spawnTimer: 0.35,
    scrollPityTimer: 3.5,
    nextEntityId: 1,
    player: {
      x: WORLD_WIDTH * 0.5,
      y: PLAYER_Y,
      vx: 0,
      radius: 34,
      tilt: 0,
      facing: 1,
      squashX: 1,
      squashY: 1,
      wingPhase: 0,
      dashTimer: 0,
      dashCooldown: 0,
      dashDir: 1,
      invulnTimer: 0,
      hitFlashTimer: 0,
    },
    entities: [],
  };
}

export function getComboMultiplier(combo: number): number {
  if (combo >= 12) return 4;
  if (combo >= 7) return 3;
  if (combo >= 3) return 2;
  return 1;
}

export function getChapterForProgress(elapsed: number, scrolls: number): 1 | 2 | 3 {
  if (scrolls >= 4 || elapsed >= 45) return 3;
  if (scrolls >= 2 || elapsed >= 22) return 2;
  return 1;
}

export function getDifficultyParams(elapsed: number, chapter: 1 | 2 | 3) {
  const ramp = clamp(elapsed / 65, 0, 1);
  const spawnInterval = 0.88 - ramp * 0.38 - (chapter - 1) * 0.05;
  const speedScale = 1 + ramp * 0.52 + (chapter - 1) * 0.1;
  const hazardChance =
    elapsed < GRACE_OPENING_SECONDS
      ? 0
      : clamp(0.18 + ramp * 0.22 + (chapter - 1) * 0.04, 0, 0.44);
  return {
    spawnInterval: Math.max(0.38, spawnInterval),
    speedScale,
    hazardChance,
  };
}

export function spawnEntity(
  state: SimulationState,
  kind: FallingKind,
  rng: () => number = Math.random
): FallingEntity {
  const margin = 58;
  const x = margin + rng() * (WORLD_WIDTH - margin * 2);
  const { speedScale } = getDifficultyParams(state.elapsed, state.chapter);

  let vy = 190 * speedScale;
  let vx = 0;
  let swayAmp = 0;
  let swayFreq = 0;
  let radius = 22;
  let telegraphTimer = 0;
  let rotSpeed = (rng() - 0.5) * 1.6;
  const isHazard = kind === 'inkblot' || kind === 'stormpuff' || kind === 'quill';

  switch (kind) {
    case 'sapphire':
      vy = (185 + rng() * 50) * speedScale;
      swayAmp = 14 + rng() * 14;
      swayFreq = 2.1 + rng() * 1.2;
      radius = 22;
      break;
    case 'macaron':
      vy = (205 + rng() * 55) * speedScale;
      swayAmp = 20 + rng() * 14;
      swayFreq = 2.6 + rng() * 1.1;
      radius = 24;
      break;
    case 'teacup':
      vy = (175 + rng() * 35) * speedScale;
      swayAmp = 12;
      swayFreq = 1.8;
      radius = 25;
      break;
    case 'scroll':
      vy = (165 + rng() * 30) * speedScale;
      swayAmp = 34;
      swayFreq = 2.4;
      radius = 27;
      rotSpeed = 0;
      break;
    case 'inkblot':
      vy = (245 + rng() * 65) * speedScale;
      radius = 23;
      break;
    case 'stormpuff':
      vy = (185 + rng() * 45) * speedScale;
      swayAmp = 68 + rng() * 32;
      swayFreq = 2.7 + rng() * 1.0;
      radius = 27;
      rotSpeed = 0;
      break;
    case 'quill': {
      telegraphTimer = 0.55;
      vy = (335 + rng() * 65) * speedScale;
      const aimDir = state.player.x > x ? 1 : -1;
      vx = aimDir * (65 + rng() * 65);
      radius = 20;
      rotSpeed = 0;
      break;
    }
  }

  const entity: FallingEntity = {
    id: state.nextEntityId++,
    kind,
    isHazard,
    x,
    y: kind === 'quill' ? 38 : -36,
    vx,
    vy,
    baseX: x,
    radius,
    phase: rng() * Math.PI * 2,
    swayAmp,
    swayFreq,
    rotation: 0,
    rotSpeed,
    telegraphTimer,
    collectedOrRemoved: false,
  };

  state.entities.push(entity);
  return entity;
}

function chooseNextKind(
  state: SimulationState,
  rng: () => number
): FallingKind {
  if (!state.endless && state.scrollPityTimer <= 0 && state.scrollsCollected < TOTAL_SCROLL_GOAL) {
    state.scrollPityTimer = 8.2 + rng() * 2.8;
    return 'scroll';
  }
  if (state.endless && state.scrollPityTimer <= 0) {
    state.scrollPityTimer = 10 + rng() * 4;
    return 'scroll';
  }

  const { hazardChance } = getDifficultyParams(state.elapsed, state.chapter);
  const roll = rng();

  if (roll < hazardChance) {
    const hRoll = rng();
    if (state.chapter >= 3 && hRoll < 0.34) return 'quill';
    if (state.chapter >= 2 && hRoll < 0.68) return 'stormpuff';
    return 'inkblot';
  }

  const gRoll = rng();
  if (state.hearts < MAX_HEARTS && gRoll < 0.14) {
    return 'teacup';
  }
  if (gRoll < 0.18 && state.scrollsCollected < TOTAL_SCROLL_GOAL && state.elapsed > 4) {
    state.scrollPityTimer = 8.0 + rng() * 2.5;
    return 'scroll';
  }
  if (gRoll < 0.52) return 'macaron';
  return 'sapphire';
}

export function stepSimulation(
  state: SimulationState,
  input: InputState,
  rawDt: number,
  rng: () => number = Math.random
): SimEvent[] {
  const dt = Math.min(Math.max(rawDt, 0), 0.05);
  const events: SimEvent[] = [];

  if (state.outcome !== 'playing') {
    return events;
  }

  // Handle brief end-of-run dramatic beat before locking outcome
  if (state.endBeatTimer > 0) {
    state.endBeatTimer = Math.max(0, state.endBeatTimer - dt);
    state.shakeTrauma = Math.max(0, state.shakeTrauma - dt * 1.8);
    state.player.hitFlashTimer = Math.max(0, state.player.hitFlashTimer - dt);
    if (state.endBeatTimer === 0) {
      if (state.hearts <= 0) {
        state.outcome = 'defeat';
        events.push({ type: 'defeat', x: state.player.x, y: state.player.y });
      }
    }
    return events;
  }

  // Decay screen trauma & hit flash in real dt even during hitstop
  state.shakeTrauma = Math.max(0, state.shakeTrauma - dt * 2.2);
  state.player.hitFlashTimer = Math.max(0, state.player.hitFlashTimer - dt);

  if (state.hitstopTimer > 0) {
    state.hitstopTimer = Math.max(0, state.hitstopTimer - dt);
    return events;
  }

  state.elapsed += dt;
  state.scrollPityTimer -= dt;

  // Chapter progression
  const nextChapter = getChapterForProgress(state.elapsed, state.scrollsCollected);
  if (nextChapter > state.chapter) {
    state.chapter = nextChapter;
    events.push({
      type: 'chapter_up',
      x: WORLD_WIDTH * 0.5,
      y: WORLD_HEIGHT * 0.35,
      chapter: nextChapter,
    });
  }

  // Combo decay
  if (state.combo > 0) {
    state.comboTimer -= dt;
    if (state.comboTimer <= 0) {
      state.combo = 0;
      state.comboTimer = 0;
    }
  }

  const p = state.player;
  p.invulnTimer = Math.max(0, p.invulnTimer - dt);
  p.dashCooldown = Math.max(0, p.dashCooldown - dt);

  // Squash recovery
  p.squashX += (1 - p.squashX) * Math.min(1, dt * 14);
  p.squashY += (1 - p.squashY) * Math.min(1, dt * 14);

  // Determine directional intent
  let moveDir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  if (moveDir === 0 && input.pointerTargetX !== null) {
    const diff = input.pointerTargetX - p.x;
    if (Math.abs(diff) > 10) {
      moveDir = diff > 0 ? 1 : -1;
    }
  }
  if (moveDir !== 0) {
    p.facing = moveDir > 0 ? 1 : -1;
  }

  // Trigger Feather Dash
  if (input.dashJustPressed && p.dashCooldown <= 0 && p.dashTimer <= 0) {
    p.dashTimer = DASH_DURATION;
    p.dashCooldown = DASH_COOLDOWN;
    p.dashDir = moveDir !== 0 ? (moveDir > 0 ? 1 : -1) : p.facing;
    p.invulnTimer = Math.max(p.invulnTimer, DASH_DURATION + 0.08);
    p.squashX = 1.28;
    p.squashY = 0.76;
    events.push({ type: 'dash', x: p.x, y: p.y });
  }

  if (p.dashTimer > 0) {
    p.dashTimer = Math.max(0, p.dashTimer - dt);
    p.vx = p.dashDir * DASH_SPEED;
  } else {
    if (moveDir !== 0) {
      p.vx += moveDir * PLAYER_ACCEL * dt;
      p.vx = clamp(p.vx, -PLAYER_MAX_SPEED, PLAYER_MAX_SPEED);
    } else if (input.pointerTargetX !== null) {
      const diff = input.pointerTargetX - p.x;
      p.vx = clamp(diff * 10, -PLAYER_MAX_SPEED, PLAYER_MAX_SPEED);
    } else {
      p.vx *= Math.exp(-PLAYER_FRICTION * dt);
      if (Math.abs(p.vx) < 4) p.vx = 0;
    }
  }

  p.x = clamp(p.x + p.vx * dt, 44, WORLD_WIDTH - 44);
  p.tilt = clamp(p.vx / PLAYER_MAX_SPEED, -1, 1) * 0.24;
  p.wingPhase += dt * (4.5 + (Math.abs(p.vx) / PLAYER_MAX_SPEED) * 10);

  // Spawning
  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    const { spawnInterval } = getDifficultyParams(state.elapsed, state.chapter);
    state.spawnTimer = spawnInterval * (0.85 + rng() * 0.3);
    const kind = chooseNextKind(state, rng);
    const spawned = spawnEntity(state, kind, rng);
    if (spawned.kind === 'quill') {
      events.push({ type: 'telegraph_quill', x: spawned.x, y: spawned.y });
    }
  }

  // Update entities & collisions
  const magnetRadius = p.dashTimer > 0 ? 115 : 0;

  for (const ent of state.entities) {
    if (ent.collectedOrRemoved) continue;

    if (ent.telegraphTimer > 0) {
      ent.telegraphTimer = Math.max(0, ent.telegraphTimer - dt);
      continue;
    }

    ent.phase += ent.swayFreq * dt;
    ent.y += ent.vy * dt;
    ent.rotation += ent.rotSpeed * dt;

    if (ent.swayAmp > 0) {
      ent.x = clamp(
        ent.baseX + Math.sin(ent.phase) * ent.swayAmp,
        36,
        WORLD_WIDTH - 36
      );
    } else if (ent.vx !== 0) {
      ent.x += ent.vx * dt;
      if (ent.x < 34 || ent.x > WORLD_WIDTH - 34) {
        ent.vx *= -1;
        ent.x = clamp(ent.x, 34, WORLD_WIDTH - 34);
      }
    }

    // Gentle dash magnet for non-hazards
    if (!ent.isHazard && magnetRadius > 0) {
      const dx = p.x - ent.x;
      const dy = p.y - ent.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 1 && dist < magnetRadius) {
        ent.x += (dx / dist) * 460 * dt;
        ent.y += (dy / dist) * 460 * dt;
      }
    }

    // Collision check with Pip
    const dx = ent.x - p.x;
    const dy = ent.y - p.y;
    const hitDist = ent.radius + p.radius * 0.84;

    if (dx * dx + dy * dy <= hitDist * hitDist) {
      if (ent.isHazard) {
        if (p.invulnTimer <= 0) {
          ent.collectedOrRemoved = true;
          state.hearts = Math.max(0, state.hearts - 1);
          state.combo = 0;
          state.comboTimer = 0;
          p.invulnTimer = 1.15;
          p.hitFlashTimer = 0.22;
          p.squashX = 1.32;
          p.squashY = 0.72;
          state.hitstopTimer = 0.055;
          state.shakeTrauma = 0.65;
          events.push({ type: 'hurt', x: ent.x, y: ent.y });

          if (state.hearts <= 0) {
            state.endBeatTimer = 0.48;
          }
        }
      } else {
        ent.collectedOrRemoved = true;
        state.combo += 1;
        state.bestCombo = Math.max(state.bestCombo, state.combo);
        state.comboTimer = COMBO_WINDOW;
        const mult = getComboMultiplier(state.combo);

        p.squashX = 0.86;
        p.squashY = 1.16;

        let basePoints = 25;
        if (ent.kind === 'macaron') basePoints = 40;
        if (ent.kind === 'teacup') basePoints = 55;
        if (ent.kind === 'scroll') basePoints = 150;

        const gained = basePoints * mult;
        state.score += gained;
        state.bestScore = Math.max(state.bestScore, state.score);

        if (ent.kind === 'teacup' && state.hearts < MAX_HEARTS) {
          state.hearts += 1;
        }

        if (ent.kind === 'scroll') {
          const blessingIndex = Math.min(
            state.scrollsCollected,
            TRIBUTE_BLESSINGS.length - 1
          );
          const blessing = TRIBUTE_BLESSINGS[blessingIndex];
          if (!state.unlockedIds.includes(blessing.id)) {
            state.unlockedIds = [...state.unlockedIds, blessing.id];
          }
          state.scrollsCollected += 1;
          state.hitstopTimer = 0.04;
          state.shakeTrauma = Math.max(state.shakeTrauma, 0.25);

          events.push({
            type: 'catch_scroll',
            x: ent.x,
            y: ent.y,
            points: gained,
            blessing,
          });

          if (!state.endless && state.scrollsCollected >= TOTAL_SCROLL_GOAL) {
            state.outcome = 'victory';
            events.push({ type: 'victory', x: p.x, y: p.y });
          }
        } else {
          const eventMap: Record<'sapphire' | 'macaron' | 'teacup', SimEvent['type']> = {
            sapphire: 'catch_sapphire',
            macaron: 'catch_macaron',
            teacup: 'catch_teacup',
          };
          events.push({
            type: eventMap[ent.kind as 'sapphire' | 'macaron' | 'teacup'],
            x: ent.x,
            y: ent.y,
            points: gained,
          });
        }
      }
      continue;
    }

    if (ent.y > WORLD_HEIGHT + 52) {
      ent.collectedOrRemoved = true;
    }
  }

  state.entities = state.entities.filter((e) => !e.collectedOrRemoved);
  return events;
}

export function extractHudSnapshot(state: SimulationState): HudSnapshot {
  return {
    score: Math.round(state.score),
    bestScore: Math.round(state.bestScore),
    hearts: state.hearts,
    combo: state.combo,
    bestCombo: state.bestCombo,
    scrollsCollected: state.scrollsCollected,
    unlockedIds: state.unlockedIds,
    chapter: state.chapter,
    endless: state.endless,
    outcome: state.outcome,
  };
}
