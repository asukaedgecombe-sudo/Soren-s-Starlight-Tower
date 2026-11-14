export type ScreenMode = 'title' | 'playing' | 'paused' | 'victory' | 'defeat';

export type BodyDataState = 'title' | 'playing' | 'paused' | 'gameover';

export type FallingKind =
  | 'sapphire'
  | 'macaron'
  | 'teacup'
  | 'scroll'
  | 'inkblot'
  | 'stormpuff'
  | 'quill';

export interface TributeBlessing {
  id: number;
  title: string;
  virtue: string;
  message: string;
  ribbonColor: string;
}

export const TRIBUTE_BLESSINGS: readonly TributeBlessing[] = [
  {
    id: 0,
    title: 'The Sapphire Quill',
    virtue: 'Wit & Curiosity',
    message: 'May every question lead Genesias Evangelium Soren to bright discoveries.',
    ribbonColor: '#3B66A8',
  },
  {
    id: 1,
    title: 'Rosewater Diadem',
    virtue: 'Grace & Wisdom',
    message: 'A gentle reminder that kindness and brilliance shine brightest together.',
    ribbonColor: '#EC4899',
  },
  {
    id: 2,
    title: 'Starlight Astrolabe',
    virtue: 'Wonder & Vision',
    message: 'Charting bold new constellations under pastel Ravenclaw skies.',
    ribbonColor: '#B8864B',
  },
  {
    id: 3,
    title: 'Sakura Spellbook',
    virtue: 'Joyful Learning',
    message: 'Pages filled with sweet moments, laughter, and cherished memories.',
    ribbonColor: '#F472B6',
  },
  {
    id: 4,
    title: 'Bronze Feather Charm',
    virtue: 'Quiet Strength',
    message: 'Soaring gracefully above every storm with a calm, steady heart.',
    ribbonColor: '#9A6B3B',
  },
  {
    id: 5,
    title: 'Velvet Wax Seal',
    virtue: 'Celebration Crown',
    message: 'Honoring Genesias Evangelium Soren today and in every chapter ahead!',
    ribbonColor: '#DB2777',
  },
];

export const TOTAL_SCROLL_GOAL = TRIBUTE_BLESSINGS.length;
export const MAX_HEARTS = 3;
export const WORLD_WIDTH = 1000;
export const WORLD_HEIGHT = 660;
export const PLAYER_Y = 574;

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  radius: number;
  tilt: number;
  facing: 1 | -1;
  squashX: number;
  squashY: number;
  wingPhase: number;
  dashTimer: number;
  dashCooldown: number;
  dashDir: 1 | -1;
  invulnTimer: number;
  hitFlashTimer: number;
}

export interface FallingEntity {
  id: number;
  kind: FallingKind;
  isHazard: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  radius: number;
  phase: number;
  swayAmp: number;
  swayFreq: number;
  rotation: number;
  rotSpeed: number;
  telegraphTimer: number;
  collectedOrRemoved: boolean;
}

export type SimEventType =
  | 'catch_sapphire'
  | 'catch_macaron'
  | 'catch_teacup'
  | 'catch_scroll'
  | 'dash'
  | 'hurt'
  | 'telegraph_quill'
  | 'chapter_up'
  | 'victory'
  | 'defeat';

export interface SimEvent {
  type: SimEventType;
  x: number;
  y: number;
  points?: number;
  blessing?: TributeBlessing;
  chapter?: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  dashJustPressed: boolean;
  pointerTargetX: number | null;
}

export interface SimulationState {
  elapsed: number;
  score: number;
  bestScore: number;
  hearts: number;
  combo: number;
  bestCombo: number;
  comboTimer: number;
  scrollsCollected: number;
  unlockedIds: number[];
  chapter: 1 | 2 | 3;
  endless: boolean;
  outcome: 'playing' | 'victory' | 'defeat';
  endBeatTimer: number;
  hitstopTimer: number;
  shakeTrauma: number;
  spawnTimer: number;
  scrollPityTimer: number;
  nextEntityId: number;
  player: PlayerState;
  entities: FallingEntity[];
}

export interface HudSnapshot {
  score: number;
  bestScore: number;
  hearts: number;
  combo: number;
  bestCombo: number;
  scrollsCollected: number;
  unlockedIds: number[];
  chapter: 1 | 2 | 3;
  endless: boolean;
  outcome: 'playing' | 'victory' | 'defeat';
}
