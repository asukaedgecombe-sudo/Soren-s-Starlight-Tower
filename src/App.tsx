import { useCallback, useEffect, useRef, useState } from 'react';
import { GameHud } from './components/GameHud';
import {
  EndModal,
  KeepsakeAlbumModal,
  PauseModal,
} from './components/StatusModals';
import { TitleScreen } from './components/TitleScreen';
import { soundEngine } from './game/audio';
import {
  createInitialSimulation,
  extractHudSnapshot,
  stepSimulation,
} from './game/engine';
import { GameRenderer } from './game/renderer';
import {
  BodyDataState,
  HudSnapshot,
  InputState,
  ScreenMode,
  SimulationState,
  TOTAL_SCROLL_GOAL,
  TributeBlessing,
  WORLD_WIDTH,
} from './game/types';

const STORAGE_BEST_KEY = 'soren_tower_best_score_v1';
const STORAGE_UNLOCKED_KEY = 'soren_tower_unlocked_v1';

function loadBestScore(): number {
  try {
    const raw = localStorage.getItem(STORAGE_BEST_KEY);
    const parsed = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

function loadUnlockedIds(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_UNLOCKED_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((n) => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

function mapScreenToBodyState(mode: ScreenMode): BodyDataState {
  if (mode === 'victory' || mode === 'defeat') return 'gameover';
  return mode;
}

export default function App() {
  const initialAutostart =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  const [screenMode, setScreenMode] = useState<ScreenMode>(
    initialAutostart ? 'playing' : 'title'
  );
  const [albumOpen, setAlbumOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [bestScore, setBestScore] = useState<number>(() => loadBestScore());
  const [unlockedAlbum, setUnlockedAlbum] = useState<number[]>(() =>
    loadUnlockedIds()
  );
  const [activeToast, setActiveToast] = useState<TributeBlessing | null>(null);

  const simRef = useRef<SimulationState>(
    createInitialSimulation(loadBestScore(), false)
  );
  const [hud, setHud] = useState<HudSnapshot>(() =>
    extractHudSnapshot(simRef.current)
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const dashBarRef = useRef<HTMLDivElement | null>(null);
  const screenModeRef = useRef<ScreenMode>(screenMode);
  const bestScoreRef = useRef<number>(bestScore);
  const toastTimerRef = useRef<number | null>(null);

  const keysHeldRef = useRef<Set<string>>(new Set());
  const touchLeftRef = useRef(false);
  const touchRightRef = useRef(false);
  const dashQueuedRef = useRef(false);
  const pointerXRef = useRef<number | null>(null);

  screenModeRef.current = screenMode;
  bestScoreRef.current = bestScore;

  useEffect(() => {
    document.body.dataset.state = mapScreenToBodyState(screenMode);
  }, [screenMode]);

  const clearInputs = useCallback(() => {
    keysHeldRef.current.clear();
    touchLeftRef.current = false;
    touchRightRef.current = false;
    dashQueuedRef.current = false;
    pointerXRef.current = null;
  }, []);

  const showToast = useCallback((blessing: TributeBlessing) => {
    setActiveToast(blessing);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setActiveToast(null);
      toastTimerRef.current = null;
    }, 3600);
  }, []);

  const startNewRun = useCallback(
    (endless = false) => {
      soundEngine.unlock();
      clearInputs();
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      const best = Math.max(bestScoreRef.current, simRef.current.bestScore);
      const nextSim = createInitialSimulation(best, endless);
      simRef.current = nextSim;
      rendererRef.current?.resetEffects();
      setActiveToast(null);
      setAlbumOpen(false);
      setHud(extractHudSnapshot(nextSim));
      setScreenMode('playing');
    },
    [clearInputs]
  );

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      soundEngine.setMuted(next);
      return next;
    });
  }, []);

  const togglePause = useCallback(() => {
    setScreenMode((prev) => {
      if (prev === 'playing') {
        clearInputs();
        return 'paused';
      }
      if (prev === 'paused') {
        clearInputs();
        return 'playing';
      }
      return prev;
    });
  }, [clearInputs]);

  // Global keyboard & focus-loss handlers
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mode = screenModeRef.current;

      if (mode === 'title' && !albumOpen && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        startNewRun(false);
        return;
      }

      if (e.key === 'm' || e.key === 'M') {
        toggleMute();
        return;
      }

      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (albumOpen && e.key === 'Escape') {
          setAlbumOpen(false);
          return;
        }
        if (mode === 'playing' || mode === 'paused') {
          e.preventDefault();
          togglePause();
        }
        return;
      }

      if ((e.key === 'r' || e.key === 'R') && (mode === 'playing' || mode === 'paused')) {
        e.preventDefault();
        startNewRun(simRef.current.endless);
        return;
      }

      if (mode === 'playing') {
        if (
          e.key === 'ArrowLeft' ||
          e.key === 'ArrowRight' ||
          e.key === 'a' ||
          e.key === 'A' ||
          e.key === 'd' ||
          e.key === 'D'
        ) {
          keysHeldRef.current.add(e.key.toLowerCase());
          pointerXRef.current = null;
        }
        if ((e.key === ' ' || e.key === 'Shift') && !e.repeat) {
          e.preventDefault();
          dashQueuedRef.current = true;
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysHeldRef.current.delete(e.key.toLowerCase());
    };

    const onBlurOrHide = () => {
      keysHeldRef.current.clear();
      touchLeftRef.current = false;
      touchRightRef.current = false;
      pointerXRef.current = null;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlurOrHide);
    document.addEventListener('visibilitychange', onBlurOrHide);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlurOrHide);
      document.removeEventListener('visibilitychange', onBlurOrHide);
    };
  }, [albumOpen, startNewRun, toggleMute, togglePause]);

  // Isolated Canvas2D + 60fps requestAnimationFrame Loop
  const inGame = screenMode !== 'title';
  useEffect(() => {
    if (!inGame) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!rendererRef.current) {
      rendererRef.current = new GameRenderer();
    }
    const renderer = rendererRef.current;

    let viewW = canvas.clientWidth || window.innerWidth;
    let viewH = canvas.clientHeight || window.innerHeight;

    let needsStaticDraw = true;
    const syncSize = () => {
      const rect = canvas.getBoundingClientRect();
      viewW = Math.max(1, rect.width);
      viewH = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = Math.round(viewW * dpr);
      const targetH = Math.round(viewH * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      needsStaticDraw = true;
    };

    syncSize();
    const ro = new ResizeObserver(syncSize);
    ro.observe(canvas);

    let rafId = 0;
    let lastTime = performance.now();

    const frame = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const sim = simRef.current;

      if (screenModeRef.current === 'playing') {
        const held = keysHeldRef.current;
        const input: InputState = {
          left: held.has('arrowleft') || held.has('a') || touchLeftRef.current,
          right: held.has('arrowright') || held.has('d') || touchRightRef.current,
          dashJustPressed: dashQueuedRef.current,
          pointerTargetX: pointerXRef.current,
        };
        dashQueuedRef.current = false;

        const prevSnap = extractHudSnapshot(sim);
        const events = stepSimulation(sim, input, rawDt);
        renderer.handleEvents(events);
        renderer.updateEffects(rawDt, sim);

        // Update Feather Dash bar directly via DOM ref (no 60Hz React state!)
        if (dashBarRef.current) {
          const readiness =
            sim.player.dashCooldown <= 0
              ? 1
              : Math.max(0, 1 - sim.player.dashCooldown / 1.65);
          dashBarRef.current.style.transform = `scaleX(${readiness.toFixed(3)})`;
        }

        // Trigger procedural audio & discrete HUD updates
        for (const ev of events) {
          if (
            ev.type === 'catch_sapphire' ||
            ev.type === 'catch_macaron' ||
            ev.type === 'catch_teacup'
          ) {
            const kind =
              ev.type === 'catch_sapphire'
                ? 'sapphire'
                : ev.type === 'catch_macaron'
                  ? 'macaron'
                  : 'teacup';
            soundEngine.playCatch(kind, sim.combo);
          } else if (ev.type === 'catch_scroll') {
            soundEngine.playScroll();
            if (ev.blessing) {
              showToast(ev.blessing);
              setUnlockedAlbum((prev) => {
                if (prev.includes(ev.blessing!.id)) return prev;
                const next = [...prev, ev.blessing!.id];
                try {
                  localStorage.setItem(STORAGE_UNLOCKED_KEY, JSON.stringify(next));
                } catch {}
                return next;
              });
            }
          } else if (ev.type === 'dash') {
            soundEngine.playDash();
          } else if (ev.type === 'hurt') {
            soundEngine.playHurt();
          } else if (ev.type === 'victory') {
            soundEngine.playVictory();
          } else if (ev.type === 'defeat') {
            soundEngine.playDefeat();
          }
        }

        const nextSnap = extractHudSnapshot(sim);
        if (
          nextSnap.score !== prevSnap.score ||
          nextSnap.hearts !== prevSnap.hearts ||
          nextSnap.combo !== prevSnap.combo ||
          nextSnap.scrollsCollected !== prevSnap.scrollsCollected ||
          nextSnap.chapter !== prevSnap.chapter ||
          nextSnap.outcome !== prevSnap.outcome
        ) {
          setHud(nextSnap);
          if (nextSnap.bestScore > bestScoreRef.current) {
            setBestScore(nextSnap.bestScore);
            try {
              localStorage.setItem(STORAGE_BEST_KEY, String(nextSnap.bestScore));
            } catch {}
          }
          if (nextSnap.outcome === 'victory') {
            setScreenMode('victory');
          } else if (nextSnap.outcome === 'defeat') {
            setScreenMode('defeat');
          }
        }
        renderer.render(ctx, viewW, viewH, sim, now / 1000);
        needsStaticDraw = true;
      } else if (needsStaticDraw) {
        renderer.render(ctx, viewW, viewH, sim, now / 1000);
        needsStaticDraw = false;
      }

      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [inGame, showToast]);

  const handleCanvasPointer = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas || screenModeRef.current !== 'playing') return;
    const rect = canvas.getBoundingClientRect();
    const normX = ((clientX - rect.left) / Math.max(1, rect.width)) * WORLD_WIDTH;
    pointerXRef.current = normX;
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      {screenMode === 'title' ? (
        <TitleScreen
          bestScore={bestScore}
          unlockedCount={unlockedAlbum.length}
          totalBlessings={TOTAL_SCROLL_GOAL}
          onStart={() => startNewRun(false)}
          onOpenAlbum={() => setAlbumOpen(true)}
        />
      ) : (
        <div className="relative h-full w-full">
          <canvas
            ref={canvasRef}
            data-testid="game-canvas"
            className="block h-full w-full touch-none"
            onPointerDown={(e) => {
              soundEngine.unlock();
              handleCanvasPointer(e.clientX);
            }}
            onPointerMove={(e) => {
              if (e.buttons > 0) handleCanvasPointer(e.clientX);
            }}
            onPointerUp={() => {
              pointerXRef.current = null;
            }}
          />

          <GameHud
            hud={hud}
            muted={muted}
            dashBarRef={dashBarRef}
            activeToast={activeToast}
            onToggleMute={toggleMute}
            onPause={togglePause}
            onRestart={() => startNewRun(simRef.current.endless)}
            onTouchLeft={(down) => {
              touchLeftRef.current = down;
            }}
            onTouchRight={(down) => {
              touchRightRef.current = down;
            }}
            onTouchDash={() => {
              soundEngine.unlock();
              dashQueuedRef.current = true;
            }}
          />

          {screenMode === 'paused' && (
            <PauseModal
              onResume={togglePause}
              onRestart={() => startNewRun(simRef.current.endless)}
              onTitle={() => {
                clearInputs();
                setScreenMode('title');
              }}
            />
          )}

          {(screenMode === 'victory' || screenMode === 'defeat') && (
            <EndModal
              outcome={screenMode}
              hud={hud}
              onPlayAgain={() => startNewRun(false)}
              onEndless={
                screenMode === 'victory' ? () => startNewRun(true) : undefined
              }
              onTitle={() => {
                clearInputs();
                setScreenMode('title');
              }}
            />
          )}
        </div>
      )}

      {albumOpen && (
        <KeepsakeAlbumModal
          unlockedIds={unlockedAlbum}
          onClose={() => setAlbumOpen(false)}
        />
      )}
    </div>
  );
}
