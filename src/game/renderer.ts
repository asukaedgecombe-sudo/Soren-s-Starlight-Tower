import {
  FallingEntity,
  SimEvent,
  SimulationState,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from './types';

interface Particle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  shape: 'circle' | 'star' | 'petal' | 'ring';
  rot: number;
  vRot: number;
}

interface FloatingText {
  active: boolean;
  x: number;
  y: number;
  vy: number;
  life: number;
  maxLife: number;
  text: string;
  color: string;
  scale: number;
}

interface AmbientPetal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vRot: number;
  alpha: number;
}

interface BgStar {
  nx: number;
  ny: number;
  r: number;
  phase: number;
  twinkleSpeed: number;
}

const MAX_PARTICLES = 180;
const MAX_FLOATING = 24;
const AMBIENT_PETALS = 26;
const BG_STARS = 44;

export class GameRenderer {
  private particles: Particle[] = [];
  private particleCursor = 0;
  private floating: FloatingText[] = [];
  private floatingCursor = 0;
  private petals: AmbientPetal[] = [];
  private stars: BgStar[] = [];
  private bgCache: HTMLCanvasElement | null = null;
  private bgCacheW = 0;
  private bgCacheH = 0;
  private bgCacheChapter = 0;

  constructor() {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.particles.push({
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 1,
        size: 4,
        color: '#F472B6',
        shape: 'circle',
        rot: 0,
        vRot: 0,
      });
    }
    for (let i = 0; i < MAX_FLOATING; i++) {
      this.floating.push({
        active: false,
        x: 0,
        y: 0,
        vy: -55,
        life: 0,
        maxLife: 1,
        text: '',
        color: '#1A2744',
        scale: 1,
      });
    }
    for (let i = 0; i < AMBIENT_PETALS; i++) {
      this.petals.push({
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        vx: -14 - Math.random() * 18,
        vy: 18 + Math.random() * 24,
        size: 4 + Math.random() * 5,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 2.2,
        alpha: 0.35 + Math.random() * 0.4,
      });
    }
    for (let i = 0; i < BG_STARS; i++) {
      this.stars.push({
        nx: Math.random(),
        ny: 0.04 + Math.random() * 0.54,
        r: 1.1 + Math.random() * 2.1,
        phase: Math.random() * Math.PI * 2,
        twinkleSpeed: 1.5 + Math.random() * 2.5,
      });
    }
  }

  public resetEffects() {
    for (const p of this.particles) p.active = false;
    for (const f of this.floating) f.active = false;
  }

  private emitParticle(
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: string,
    shape: Particle['shape'],
    size: number,
    maxLife: number
  ) {
    const p = this.particles[this.particleCursor];
    this.particleCursor = (this.particleCursor + 1) % MAX_PARTICLES;
    p.active = true;
    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;
    p.color = color;
    p.shape = shape;
    p.size = size;
    p.life = maxLife;
    p.maxLife = maxLife;
    p.rot = Math.random() * Math.PI * 2;
    p.vRot = (Math.random() - 0.5) * 6;
  }

  private emitFloating(
    x: number,
    y: number,
    text: string,
    color: string,
    scale = 1
  ) {
    const f = this.floating[this.floatingCursor];
    this.floatingCursor = (this.floatingCursor + 1) % MAX_FLOATING;
    f.active = true;
    f.x = x;
    f.y = y;
    f.vy = -62;
    f.life = 0.85;
    f.maxLife = 0.85;
    f.text = text;
    f.color = color;
    f.scale = scale;
  }

  public handleEvents(events: SimEvent[]) {
    for (const ev of events) {
      if (ev.type === 'catch_sapphire') {
        for (let i = 0; i < 8; i++) {
          const ang = (i / 8) * Math.PI * 2 + Math.random() * 0.4;
          const spd = 70 + Math.random() * 90;
          this.emitParticle(
            ev.x,
            ev.y,
            Math.cos(ang) * spd,
            Math.sin(ang) * spd - 30,
            i % 2 === 0 ? '#3B82F6' : '#93C5FD',
            'star',
            4.5,
            0.55
          );
        }
        this.emitFloating(ev.x, ev.y - 14, `+${ev.points ?? 25}`, '#1E3A8A', 1);
      } else if (ev.type === 'catch_macaron') {
        for (let i = 0; i < 9; i++) {
          const ang = (i / 9) * Math.PI * 2;
          const spd = 60 + Math.random() * 100;
          this.emitParticle(
            ev.x,
            ev.y,
            Math.cos(ang) * spd,
            Math.sin(ang) * spd - 35,
            i % 2 === 0 ? '#F472B6' : '#FBCFE8',
            'petal',
            5.5,
            0.6
          );
        }
        this.emitFloating(ev.x, ev.y - 14, `+${ev.points ?? 40}`, '#BE185D', 1.05);
      } else if (ev.type === 'catch_teacup') {
        for (let i = 0; i < 12; i++) {
          const ang = (i / 12) * Math.PI * 2;
          const spd = 75 + Math.random() * 90;
          this.emitParticle(
            ev.x,
            ev.y,
            Math.cos(ang) * spd,
            Math.sin(ang) * spd - 40,
            i % 2 === 0 ? '#FB7185' : '#FDE68A',
            'star',
            5.5,
            0.7
          );
        }
        this.emitFloating(ev.x, ev.y - 16, `+${ev.points ?? 55} ♥`, '#E11D48', 1.15);
      } else if (ev.type === 'catch_scroll') {
        for (let i = 0; i < 24; i++) {
          const ang = (i / 24) * Math.PI * 2;
          const spd = 95 + Math.random() * 145;
          const colors = ['#F472B6', '#FBBF24', '#3B66A8', '#FBCFE8'];
          this.emitParticle(
            ev.x,
            ev.y,
            Math.cos(ang) * spd,
            Math.sin(ang) * spd - 50,
            colors[i % colors.length],
            i % 2 === 0 ? 'star' : 'petal',
            6.5,
            0.85
          );
        }
        this.emitFloating(
          ev.x,
          ev.y - 20,
          `Scroll! +${ev.points ?? 150}`,
          '#9A6B3B',
          1.28
        );
      } else if (ev.type === 'dash') {
        for (let i = 0; i < 10; i++) {
          this.emitParticle(
            ev.x + (Math.random() - 0.5) * 20,
            ev.y + (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 60,
            i % 2 === 0 ? '#F9A8D4' : '#93C5FD',
            'star',
            5,
            0.42
          );
        }
      } else if (ev.type === 'hurt') {
        for (let i = 0; i < 16; i++) {
          const ang = (i / 16) * Math.PI * 2;
          const spd = 80 + Math.random() * 130;
          this.emitParticle(
            ev.x,
            ev.y,
            Math.cos(ang) * spd,
            Math.sin(ang) * spd - 30,
            i % 2 === 0 ? '#312E81' : '#FB7185',
            'circle',
            5,
            0.6
          );
        }
        this.emitFloating(ev.x, ev.y - 18, 'Ouch!', '#BE123C', 1.15);
      } else if (ev.type === 'chapter_up') {
        this.emitFloating(
          WORLD_WIDTH * 0.5,
          WORLD_HEIGHT * 0.34,
          `Chapter ${ev.chapter === 2 ? 'II' : 'III'}`,
          '#1A2744',
          1.5
        );
      }
    }
  }

  public updateEffects(dt: number, sim: SimulationState) {
    const clamped = Math.min(dt, 0.05);

    if (sim.player.dashTimer > 0) {
      this.emitParticle(
        sim.player.x - sim.player.dashDir * 18,
        sim.player.y + (Math.random() - 0.5) * 18,
        -sim.player.dashDir * 80,
        (Math.random() - 0.5) * 40,
        Math.random() > 0.5 ? '#FBCFE8' : '#BAE6FD',
        'petal',
        5,
        0.32
      );
    }

    for (const p of this.particles) {
      if (!p.active) continue;
      p.life -= clamped;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }
      p.x += p.vx * clamped;
      p.y += p.vy * clamped;
      p.vy += 170 * clamped;
      p.rot += p.vRot * clamped;
    }

    for (const f of this.floating) {
      if (!f.active) continue;
      f.life -= clamped;
      if (f.life <= 0) {
        f.active = false;
        continue;
      }
      f.y += f.vy * clamped;
    }

    for (const pet of this.petals) {
      pet.x += pet.vx * clamped;
      pet.y += pet.vy * clamped;
      pet.rot += pet.vRot * clamped;
      if (pet.y > WORLD_HEIGHT + 16 || pet.x < -20) {
        pet.x = Math.random() * (WORLD_WIDTH + 120);
        pet.y = -14;
      }
    }
  }

  private ensureBackdropCache(
    viewW: number,
    viewH: number,
    chapter: 1 | 2 | 3,
    playerY: number,
    spriteScale: number
  ) {
    if (
      this.bgCache &&
      this.bgCacheW === viewW &&
      this.bgCacheH === viewH &&
      this.bgCacheChapter === chapter
    ) {
      return this.bgCache;
    }

    if (!this.bgCache) {
      this.bgCache = document.createElement('canvas');
    }
    this.bgCache.width = Math.max(1, Math.round(viewW));
    this.bgCache.height = Math.max(1, Math.round(viewH));
    this.bgCacheW = viewW;
    this.bgCacheH = viewH;
    this.bgCacheChapter = chapter;

    const bctx = this.bgCache.getContext('2d');
    if (!bctx) return this.bgCache;

    const scaleY = viewH / WORLD_HEIGHT;

    // Sky gradient
    const sky = bctx.createLinearGradient(0, 0, 0, viewH);
    if (chapter === 1) {
      sky.addColorStop(0, '#DCE4F7');
      sky.addColorStop(0.45, '#F5DFEE');
      sky.addColorStop(1, '#FFF3F8');
    } else if (chapter === 2) {
      sky.addColorStop(0, '#C8D6F3');
      sky.addColorStop(0.48, '#EBD6EE');
      sky.addColorStop(1, '#FCEBF4');
    } else {
      sky.addColorStop(0, '#B3C4EA');
      sky.addColorStop(0.5, '#DFCCF0');
      sky.addColorStop(1, '#FADEEB');
    }
    bctx.fillStyle = sky;
    bctx.fillRect(0, 0, viewW, viewH);

    this.drawBackdropArchitecture(bctx, viewW, viewH, spriteScale);

    // Ravenclaw Stone Balcony Floor
    const floorY = (playerY + 34) * scaleY;
    const floorGrad = bctx.createLinearGradient(0, floorY, 0, viewH);
    floorGrad.addColorStop(0, '#E9D7E3');
    floorGrad.addColorStop(0.25, '#D7C4D8');
    floorGrad.addColorStop(1, '#B8A8C6');
    bctx.fillStyle = floorGrad;
    bctx.fillRect(0, floorY, viewW, viewH - floorY);

    // Subtle stone baluster pattern along the balcony front
    const step = Math.max(48, 72 * spriteScale);
    bctx.fillStyle = 'rgba(130, 114, 150, 0.22)';
    for (let bx = step * 0.5; bx < viewW; bx += step) {
      bctx.beginPath();
      bctx.roundRect(
        bx - 7 * spriteScale,
        floorY + 12 * spriteScale,
        14 * spriteScale,
        Math.max(18, viewH - floorY - 16 * spriteScale),
        6 * spriteScale
      );
      bctx.fill();
    }

    bctx.fillStyle = '#B8864B';
    bctx.fillRect(0, floorY, viewW, Math.max(4, 5 * spriteScale));
    bctx.fillStyle = '#F9A8D4';
    bctx.fillRect(
      0,
      floorY + Math.max(4, 5 * spriteScale),
      viewW,
      Math.max(2, 3 * spriteScale)
    );

    return this.bgCache;
  }

  public render(
    ctx: CanvasRenderingContext2D,
    viewW: number,
    viewH: number,
    sim: SimulationState,
    timeNow: number
  ) {
    const scaleX = viewW / WORLD_WIDTH;
    const scaleY = viewH / WORLD_HEIGHT;
    const spriteScale = Math.max(0.68, Math.min(scaleX, scaleY));

    const shakeMag = sim.shakeTrauma * sim.shakeTrauma * 12;
    const shakeX = shakeMag > 0.1 ? (Math.random() - 0.5) * 2 * shakeMag : 0;
    const shakeY = shakeMag > 0.1 ? (Math.random() - 0.5) * 2 * shakeMag : 0;

    ctx.save();
    ctx.translate(shakeX, shakeY);

    // 1. Cached Pastel Sky, Moon, Towers & Balcony Floor
    const backdrop = this.ensureBackdropCache(
      viewW,
      viewH,
      sim.chapter,
      sim.player.y,
      spriteScale
    );
    ctx.drawImage(backdrop, 0, 0, viewW, viewH);

    // 2. Twinkling stars
    for (const s of this.stars) {
      const alpha = 0.35 + 0.5 * Math.sin(timeNow * s.twinkleSpeed + s.phase);
      const sx = s.nx * viewW;
      const sy = s.ny * viewH;
      ctx.fillStyle = `rgba(255, 250, 240, ${alpha.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(sx, sy, s.r * spriteScale, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Ambient drifting sakura petals
    for (const pet of this.petals) {
      ctx.save();
      ctx.translate(pet.x * scaleX, pet.y * scaleY);
      ctx.rotate(pet.rot);
      ctx.fillStyle = `rgba(244, 143, 177, ${pet.alpha})`;
      ctx.beginPath();
      ctx.ellipse(
        0,
        0,
        pet.size * spriteScale,
        pet.size * 0.56 * spriteScale,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    }

    // 6. Falling entities & telegraphs
    for (const ent of sim.entities) {
      this.drawEntity(ctx, ent, scaleX, scaleY, spriteScale, timeNow);
    }

    // 7. Pip the Cute Ravenclaw Owl
    this.drawPipOwl(ctx, sim, scaleX, scaleY, spriteScale, timeNow);

    // 8. Pooled particles
    for (const p of this.particles) {
      if (!p.active) continue;
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x * scaleX, p.y * scaleY);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      const sz = p.size * spriteScale;
      if (p.shape === 'star') {
        this.drawFourPointStar(ctx, 0, 0, sz * 1.3);
      } else if (p.shape === 'petal') {
        ctx.beginPath();
        ctx.ellipse(0, 0, sz, sz * 0.58, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, sz * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 9. Floating score popups
    for (const f of this.floating) {
      if (!f.active) continue;
      const alpha = Math.min(1, (f.life / f.maxLife) * 1.4);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `700 ${Math.round(18 * spriteScale * f.scale)}px "Fraunces", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 4 * spriteScale;
      ctx.strokeStyle = '#FFF9FB';
      ctx.strokeText(f.text, f.x * scaleX, f.y * scaleY);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x * scaleX, f.y * scaleY);
      ctx.restore();
    }

    ctx.restore();
  }

  private drawBackdropArchitecture(
    ctx: CanvasRenderingContext2D,
    viewW: number,
    viewH: number,
    s: number
  ) {
    // True seamless crescent moon with soft warm halo (upper right)
    const moonX = viewW * 0.84;
    const moonY = viewH * 0.17;
    const r = 32 * s;
    ctx.save();
    ctx.fillStyle = 'rgba(255, 248, 220, 0.28)';
    ctx.beginPath();
    ctx.arc(moonX, moonY, r * 1.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 250, 232, 0.94)';
    ctx.beginPath();
    ctx.arc(moonX, moonY, r, Math.PI * 0.28, Math.PI * 1.72, false);
    ctx.bezierCurveTo(
      moonX - r * 0.15,
      moonY - r * 0.52,
      moonX - r * 0.15,
      moonY + r * 0.52,
      moonX + Math.cos(Math.PI * 0.28) * r,
      moonY + Math.sin(Math.PI * 0.28) * r
    );
    ctx.closePath();
    ctx.fill();

    // Gothic Ravenclaw Spire Silhouettes along left & right edges
    ctx.fillStyle = 'rgba(116, 132, 178, 0.18)';
    // Left tower with pointed finial & arched window glow
    ctx.beginPath();
    ctx.moveTo(0, viewH);
    ctx.lineTo(0, viewH * 0.42);
    ctx.lineTo(viewW * 0.065, viewH * 0.23);
    ctx.lineTo(viewW * 0.13, viewH * 0.42);
    ctx.lineTo(viewW * 0.13, viewH);
    ctx.closePath();
    ctx.fill();

    // Right tower with pointed finial
    ctx.beginPath();
    ctx.moveTo(viewW, viewH);
    ctx.lineTo(viewW, viewH * 0.44);
    ctx.lineTo(viewW * 0.925, viewH * 0.25);
    ctx.lineTo(viewW * 0.85, viewH * 0.44);
    ctx.lineTo(viewW * 0.85, viewH);
    ctx.closePath();
    ctx.fill();

    // Warm arched tower windows
    ctx.fillStyle = 'rgba(253, 230, 138, 0.34)';
    for (const wx of [viewW * 0.065, viewW * 0.925]) {
      const wy = viewH * 0.52;
      ctx.beginPath();
      ctx.arc(wx, wy, 10 * s, Math.PI, 0);
      ctx.lineTo(wx + 10 * s, wy + 22 * s);
      ctx.lineTo(wx - 10 * s, wy + 22 * s);
      ctx.closePath();
      ctx.fill();
    }

    // 5-petal pastel sakura blossom clusters in top corners
    const clusters = [
      { x: 0.04, y: 0.09, r: 10 },
      { x: 0.09, y: 0.05, r: 8.5 },
      { x: 0.07, y: 0.15, r: 7.5 },
      { x: 0.96, y: 0.09, r: 10 },
      { x: 0.91, y: 0.05, r: 8.5 },
      { x: 0.93, y: 0.15, r: 7.5 },
    ];
    for (const c of clusters) {
      const cx = viewW * c.x;
      const cy = viewH * c.y;
      const pr = c.r * s;
      ctx.fillStyle = 'rgba(249, 168, 212, 0.55)';
      for (let p = 0; p < 5; p++) {
        const ang = (p / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(
          cx + Math.cos(ang) * pr * 0.65,
          cy + Math.sin(ang) * pr * 0.65,
          pr * 0.58,
          pr * 0.38,
          ang,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(253, 230, 138, 0.72)';
      ctx.beginPath();
      ctx.arc(cx, cy, pr * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawFourPointStar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.quadraticCurveTo(x, y, x, y + r);
    ctx.quadraticCurveTo(x, y, x - r, y);
    ctx.quadraticCurveTo(x, y, x, y - r);
    ctx.fill();
  }

  private drawEntity(
    ctx: CanvasRenderingContext2D,
    ent: FallingEntity,
    scaleX: number,
    scaleY: number,
    s: number,
    timeNow: number
  ) {
    const px = ent.x * scaleX;
    const py = ent.y * scaleY;

    // Telegraph warning for rogue quills before drop
    if (ent.kind === 'quill' && ent.telegraphTimer > 0) {
      const pulse = 0.55 + 0.45 * Math.sin(timeNow * 24);
      ctx.save();
      ctx.strokeStyle = `rgba(225, 29, 72, ${pulse})`;
      ctx.lineWidth = 2.5 * s;
      ctx.setLineDash([5 * s, 4 * s]);
      ctx.beginPath();
      ctx.moveTo(px, py + 12 * s);
      ctx.lineTo(px + ent.vx * 0.45 * scaleX, py + 140 * scaleY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#FFE4E6';
      ctx.strokeStyle = '#BE123C';
      ctx.lineWidth = 2.5 * s;
      ctx.beginPath();
      ctx.arc(px, py, 16 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#BE123C';
      ctx.font = `700 ${Math.round(16 * s)}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', px, py + 1 * s);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(ent.rotation);
    ctx.scale(s, s);

    switch (ent.kind) {
      case 'sapphire': {
        // Faceted Ravenclaw Sapphire Gem
        ctx.fillStyle = 'rgba(59, 130, 246, 0.22)';
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#2563EB';
        ctx.strokeStyle = '#1E3A8A';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(15, -4);
        ctx.lineTo(11, 16);
        ctx.lineTo(-11, 16);
        ctx.lineTo(-15, -4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#93C5FD';
        ctx.beginPath();
        ctx.moveTo(0, -13);
        ctx.lineTo(8, -3);
        ctx.lineTo(0, 8);
        ctx.lineTo(-8, -3);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'macaron': {
        // Pastel Pink Macaron
        ctx.fillStyle = '#F472B6';
        ctx.strokeStyle = '#9D174D';
        ctx.lineWidth = 2;
        // Top shell
        ctx.beginPath();
        ctx.ellipse(0, -6, 18, 9, 0, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Cream filling
        ctx.fillStyle = '#FFF1F2';
        ctx.beginPath();
        ctx.roundRect(-17, -4, 34, 8, 4);
        ctx.fill();
        ctx.stroke();
        // Bottom shell
        ctx.fillStyle = '#F9A8D4';
        ctx.beginPath();
        ctx.ellipse(0, 6, 18, 8, 0, 0, Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'teacup': {
        // Rose Tea Cup (Heals +1 Heart)
        ctx.fillStyle = '#FFF5F8';
        ctx.strokeStyle = '#BE185D';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(14, 0, 6, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-15, -7);
        ctx.lineTo(15, -7);
        ctx.quadraticCurveTo(14, 13, 0, 13);
        ctx.quadraticCurveTo(-14, 13, -15, -7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Pink tea + tiny heart
        ctx.fillStyle = '#F43F5E';
        ctx.beginPath();
        ctx.ellipse(0, -7, 13, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#E11D48';
        ctx.font = '700 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('♥', 0, 6);
        break;
      }

      case 'scroll': {
        // Glowing Wax-Sealed Celebration Scroll
        const halo = 27 + Math.sin(timeNow * 6) * 3;
        ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
        ctx.beginPath();
        ctx.arc(0, 0, halo, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFF8E7';
        ctx.strokeStyle = '#9A6B3B';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.roundRect(-19, -13, 38, 26, 6);
        ctx.fill();
        ctx.stroke();

        // Pink satin ribbon band
        ctx.fillStyle = '#EC4899';
        ctx.fillRect(-4, -13, 8, 26);

        // Wax seal
        ctx.fillStyle = '#BE185D';
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FDE68A';
        this.drawFourPointStar(ctx, 0, 0, 4.5);
        break;
      }

      case 'inkblot': {
        // Mischievous Ink Splat Hazard
        ctx.fillStyle = '#1E1B4B';
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const ang = (i / 10) * Math.PI * 2;
          const r = i % 2 === 0 ? 20 : 13;
          const px0 = Math.cos(ang) * r;
          const py0 = Math.sin(ang) * r;
          if (i === 0) ctx.moveTo(px0, py0);
          else ctx.lineTo(px0, py0);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Grumpy eyes
        ctx.fillStyle = '#FFF1F2';
        ctx.beginPath();
        ctx.arc(-5, -1, 3, 0, Math.PI * 2);
        ctx.arc(5, -1, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#F43F5E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-8, -6);
        ctx.lineTo(-2, -3);
        ctx.moveTo(8, -6);
        ctx.lineTo(2, -3);
        ctx.stroke();
        break;
      }

      case 'stormpuff': {
        // Sleepy Grumpy Storm Puff
        ctx.fillStyle = '#475569';
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(-11, 2, 11, 0, Math.PI * 2);
        ctx.arc(11, 2, 11, 0, Math.PI * 2);
        ctx.arc(0, -6, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Tiny lightning bolt
        ctx.fillStyle = '#FBBF24';
        ctx.beginPath();
        ctx.moveTo(2, 8);
        ctx.lineTo(-4, 16);
        ctx.lineTo(1, 16);
        ctx.lineTo(-3, 24);
        ctx.lineTo(6, 14);
        ctx.lineTo(1, 14);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'quill': {
        // Swooping Rogue Enchanted Quill
        const angle = Math.atan2(ent.vy, ent.vx) - Math.PI / 2;
        ctx.rotate(angle);
        ctx.fillStyle = '#9F1239';
        ctx.strokeStyle = '#1A2744';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 20);
        ctx.lineTo(8, -6);
        ctx.lineTo(0, -22);
        ctx.lineTo(-8, -6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#FDE68A';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(0, 17);
        ctx.lineTo(0, -18);
        ctx.stroke();
        break;
      }
    }

    ctx.restore();
  }

  private drawPipOwl(
    ctx: CanvasRenderingContext2D,
    sim: SimulationState,
    scaleX: number,
    scaleY: number,
    s: number,
    timeNow: number
  ) {
    const p = sim.player;
    const px = p.x * scaleX;
    const py = p.y * scaleY;

    // Blink softly during post-hit invulnerability
    if (p.invulnTimer > 0 && p.dashTimer <= 0 && Math.floor(timeNow * 18) % 2 === 0) {
      ctx.save();
      ctx.globalAlpha = 0.48;
      this.drawPipGeometry(ctx, px, py, sim, s, timeNow);
      ctx.restore();
      return;
    }

    this.drawPipGeometry(ctx, px, py, sim, s, timeNow);
  }

  private drawPipGeometry(
    ctx: CanvasRenderingContext2D,
    px: number,
    py: number,
    sim: SimulationState,
    s: number,
    timeNow: number
  ) {
    const p = sim.player;
    const isHitFlash = p.hitFlashTimer > 0;

    // Ground shadow on balcony
    ctx.save();
    ctx.fillStyle = 'rgba(26, 39, 68, 0.16)';
    ctx.beginPath();
    ctx.ellipse(px, py + 31 * s, 26 * s * p.squashX, 6 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(p.tilt);
    ctx.scale(s * p.squashX, s * p.squashY);

    // Dash aura ring
    if (p.dashTimer > 0) {
      ctx.fillStyle = 'rgba(244, 114, 182, 0.25)';
      ctx.beginPath();
      ctx.arc(0, 0, 42, 0, Math.PI * 2);
      ctx.fill();
    }

    // Flapping wings
    const flap = Math.sin(p.wingPhase) * 0.42;
    ctx.fillStyle = isHitFlash ? '#FFF1F2' : '#E2E8F0';
    ctx.strokeStyle = '#1A2744';
    ctx.lineWidth = 2.4;

    ctx.save();
    ctx.translate(-26, 2);
    ctx.rotate(-0.35 + flap);
    ctx.beginPath();
    ctx.ellipse(-6, 4, 10, 17, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(26, 2);
    ctx.rotate(0.35 - flap);
    ctx.beginPath();
    ctx.ellipse(6, 4, 10, 17, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Plump snowy-cream owl body
    ctx.fillStyle = isHitFlash ? '#FFE4E6' : '#FFFDF9';
    ctx.strokeStyle = '#1A2744';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.ellipse(0, 2, 28, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Soft blush tummy patch
    ctx.fillStyle = isHitFlash ? '#FECDD3' : '#FCE7F3';
    ctx.beginPath();
    ctx.ellipse(0, 13, 17, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tiny bronze feet
    ctx.strokeStyle = '#B8864B';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-10, 30);
    ctx.lineTo(-10, 34);
    ctx.moveTo(10, 30);
    ctx.lineTo(10, 34);
    ctx.stroke();

    // Ravenclaw Sapphire & Bronze Striped Scarf
    ctx.fillStyle = '#1E3A8A';
    ctx.strokeStyle = '#1A2744';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-22, 6, 44, 10, 5);
    ctx.fill();
    ctx.stroke();
    // Bronze stripes
    ctx.fillStyle = '#C49A6C';
    ctx.fillRect(-13, 7, 5, 8);
    ctx.fillRect(7, 7, 5, 8);
    // Trailing scarf tail
    ctx.save();
    ctx.translate(-14 * p.facing, 13);
    ctx.rotate(-p.tilt * 1.4 + Math.sin(timeNow * 8) * 0.12);
    ctx.fillStyle = '#1E3A8A';
    ctx.beginPath();
    ctx.roundRect(-6, 0, 12, 16, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#C49A6C';
    ctx.fillRect(-5, 8, 10, 3);
    ctx.restore();

    // Cute Rosy Cheeks
    ctx.fillStyle = 'rgba(244, 114, 182, 0.55)';
    ctx.beginPath();
    ctx.ellipse(-16, -2, 5, 3.2, 0, 0, Math.PI * 2);
    ctx.ellipse(16, -2, 5, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Big Expressive Eyes
    ctx.fillStyle = '#1A2744';
    ctx.beginPath();
    ctx.arc(-10, -8, 4.8, 0, Math.PI * 2);
    ctx.arc(10, -8, 4.8, 0, Math.PI * 2);
    ctx.fill();

    // Eye catchlights
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-11.4, -9.6, 1.9, 0, Math.PI * 2);
    ctx.arc(8.6, -9.6, 1.9, 0, Math.PI * 2);
    ctx.fill();

    // Tiny golden beak
    ctx.fillStyle = '#F59E0B';
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-4, -5);
    ctx.lineTo(4, -5);
    ctx.lineTo(0, 1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Pastel Pink Beret with tiny bronze feather pin
    ctx.fillStyle = '#F472B6';
    ctx.strokeStyle = '#9D174D';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(2, -26, 18, 9, -0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#BE185D';
    ctx.beginPath();
    ctx.arc(2, -34, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
