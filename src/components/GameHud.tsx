import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  HudSnapshot,
  MAX_HEARTS,
  TOTAL_SCROLL_GOAL,
  TributeBlessing,
} from '../game/types';

interface GameHudProps {
  hud: HudSnapshot;
  muted: boolean;
  dashBarRef: React.RefObject<HTMLDivElement | null>;
  activeToast: TributeBlessing | null;
  onToggleMute: () => void;
  onPause: () => void;
  onRestart: () => void;
  onTouchLeft: (down: boolean) => void;
  onTouchRight: (down: boolean) => void;
  onTouchDash: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  hud,
  muted,
  dashBarRef,
  activeToast,
  onToggleMute,
  onPause,
  onRestart,
  onTouchLeft,
  onTouchRight,
  onTouchDash,
}) => {
  const chapterRoman = hud.chapter === 1 ? 'I' : hud.chapter === 2 ? 'II' : 'III';

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-3 sm:p-5">
      {/* Top Perimeter Clusters */}
      <div className="flex items-start justify-between gap-3">
        {/* Top-Left: Score, Combo & Chapter */}
        <div
          className="rounded-xl border border-[#C49A6C]/80 bg-[#FFF8FB]/95 px-3.5 py-2 shadow-[0_4px_14px_rgba(26,39,68,0.08)]"
          aria-live="polite"
        >
          <div className="flex items-baseline gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                Score
              </div>
              <div
                data-testid="hud-score"
                className="font-mono text-2xl font-bold leading-none text-[#1A2744] tabular-nums"
              >
                {hud.score}
              </div>
            </div>

            <div className="h-7 w-px bg-[#E2C9D6]" aria-hidden="true" />

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                Chapter
              </div>
              <div className="font-display text-lg font-bold leading-none text-[#1E3A8A]">
                {chapterRoman}
              </div>
            </div>

            {hud.combo >= 2 && (
              <>
                <div className="h-7 w-px bg-[#E2C9D6]" aria-hidden="true" />
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#BE185D]">
                    Combo
                  </div>
                  <div className="font-mono text-lg font-bold leading-none text-[#BE185D] tabular-nums">
                    {hud.combo}x
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top-Center: 6 Celebration Scrolls Progress Sockets */}
        <div className="hidden sm:flex flex-col items-center rounded-xl border border-[#C49A6C]/80 bg-[#FFF8FB]/95 px-4 py-2 shadow-[0_4px_14px_rgba(26,39,68,0.08)]">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
            {hud.endless ? 'Celebration Scrolls' : `Soren Scrolls · ${hud.scrollsCollected}/${TOTAL_SCROLL_GOAL}`}
          </div>
          <div className="flex items-center gap-1.5" aria-label={`Scrolls collected: ${hud.scrollsCollected} of ${TOTAL_SCROLL_GOAL}`}>
            {Array.from({ length: TOTAL_SCROLL_GOAL }).map((_, i) => {
              const filled = hud.endless ? i < hud.scrollsCollected % TOTAL_SCROLL_GOAL : i < hud.scrollsCollected;
              return (
                <svg key={i} viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <circle
                    cx="12"
                    cy="12"
                    r="9.5"
                    fill={filled ? '#EC4899' : '#FCE7F3'}
                    stroke={filled ? '#9D174D' : '#C49A6C'}
                    strokeWidth="2"
                  />
                  {filled && (
                    <path
                      d="M12 6.5 L13.4 10.6 L17.5 12 L13.4 13.4 L12 17.5 L10.6 13.4 L6.5 12 L10.6 10.6 Z"
                      fill="#FFF8FB"
                    />
                  )}
                </svg>
              );
            })}
          </div>
        </div>

        {/* Top-Right: Vitality Hearts + Square Icon Utility Buttons */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 rounded-xl border border-[#C49A6C]/80 bg-[#FFF8FB]/95 px-3 py-2 shadow-[0_4px_14px_rgba(26,39,68,0.08)]"
            aria-label={`Hearts remaining: ${hud.hearts} of ${MAX_HEARTS}`}
          >
            {Array.from({ length: MAX_HEARTS }).map((_, i) => {
              const full = i < hud.hearts;
              return (
                <svg key={i} viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    d="M12 20.5 C12 20.5 4 14.8 4 9.2 C4 6.5 6.2 4.5 8.7 4.5 C10.3 4.5 11.4 5.3 12 6.4 C12.6 5.3 13.7 4.5 15.3 4.5 C17.8 4.5 20 6.5 20 9.2 C20 14.8 12 20.5 12 20.5 Z"
                    fill={full ? '#E11D48' : '#FCE7F3'}
                    stroke={full ? '#881337' : '#C49A6C'}
                    strokeWidth="2"
                  />
                </svg>
              );
            })}
          </div>

          <div className="pointer-events-auto flex items-center gap-1.5">
            <button
              type="button"
              tabIndex={-1}
              aria-label={muted ? 'Unmute audio (M)' : 'Mute audio (M)'}
              onClick={(e) => {
                e.currentTarget.blur();
                onToggleMute();
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#C49A6C] bg-[#FFF8FB] text-[#1A2744] shadow-sm transition-colors hover:bg-[#FCE7F3] cursor-pointer"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>

            <button
              type="button"
              tabIndex={-1}
              aria-label="Pause game (P)"
              onClick={(e) => {
                e.currentTarget.blur();
                onPause();
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#C49A6C] bg-[#FFF8FB] text-[#1A2744] shadow-sm transition-colors hover:bg-[#FCE7F3] cursor-pointer"
            >
              <Pause className="h-4 w-4" />
            </button>

            <button
              type="button"
              tabIndex={-1}
              aria-label="Restart game (R)"
              onClick={(e) => {
                e.currentTarget.blur();
                onRestart();
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#C49A6C] bg-[#FFF8FB] text-[#1A2744] shadow-sm transition-colors hover:bg-[#FCE7F3] cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Non-Blocking Blessing Toast when a Soren Scroll is Caught */}
      {activeToast && (
        <div className="mx-auto mb-auto mt-3 max-w-md rounded-xl border border-[#EC4899]/60 bg-[#FFF8FB]/95 px-4 py-2.5 text-center shadow-[0_6px_20px_rgba(190,24,93,0.16)]">
          <div className="text-xs font-bold uppercase tracking-wider text-[#BE185D]">
            Keepsake Unlocked · {activeToast.title}
          </div>
          <div className="mt-0.5 text-sm font-medium text-[#1A2744]">
            {activeToast.message}
          </div>
        </div>
      )}

      {/* Bottom Perimeter: Feather Dash Gauge + Touch Controls */}
      <div className="flex items-end justify-between gap-3">
        <div className="rounded-xl border border-[#C49A6C]/80 bg-[#FFF8FB]/95 px-3.5 py-2 shadow-sm">
          <div className="mb-1 flex items-center justify-between gap-4 text-[11px] font-semibold uppercase tracking-wider text-[#475569]">
            <span>Feather Dash</span>
            <span className="font-mono text-[#1E3A8A]">Space</span>
          </div>
          <div className="h-2 w-28 overflow-hidden rounded-full bg-[#F3E1EC]">
            <div
              ref={dashBarRef}
              className="h-full origin-left bg-[#EC4899] transition-none"
              style={{ transform: 'scaleX(1)' }}
            />
          </div>
        </div>

        {/* Mobile Touch Controls */}
        <div className="pointer-events-auto flex items-center gap-2 md:hidden">
          <button
            type="button"
            aria-label="Move left"
            onPointerDown={() => onTouchLeft(true)}
            onPointerUp={() => onTouchLeft(false)}
            onPointerLeave={() => onTouchLeft(false)}
            onPointerCancel={() => onTouchLeft(false)}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#C49A6C] bg-[#FFF8FB]/95 text-[#1A2744] active:bg-[#FCE7F3]"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Feather Dash"
            onClick={onTouchDash}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#BE185D] bg-[#FCE7F3] text-[#BE185D] active:bg-[#FBCFE8]"
          >
            <Sparkles className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Move right"
            onPointerDown={() => onTouchRight(true)}
            onPointerUp={() => onTouchRight(false)}
            onPointerLeave={() => onTouchRight(false)}
            onPointerCancel={() => onTouchRight(false)}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#C49A6C] bg-[#FFF8FB]/95 text-[#1A2744] active:bg-[#FCE7F3]"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
