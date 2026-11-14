import React from 'react';
import { Lock, Play, RotateCcw, Sparkles, X } from 'lucide-react';
import {
  HudSnapshot,
  TOTAL_SCROLL_GOAL,
  TRIBUTE_BLESSINGS,
} from '../game/types';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onTitle,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
      className="fixed inset-0 z-30 flex items-center justify-center bg-[#1A2744]/45 p-4"
    >
      <div className="w-full max-w-sm rounded-2xl border-2 border-[#C49A6C] bg-[#FFF8FB] p-6 text-center shadow-2xl">
        <h2
          id="pause-title"
          className="font-display text-3xl font-bold text-[#1A2744]"
        >
          Tower Paused
        </h2>
        <p className="mt-1.5 text-sm text-[#475569]">
          Pip is resting on the Ravenclaw balustrade.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onResume}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E3A8A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#172D6E] cursor-pointer"
          >
            <Play className="h-4 w-4 fill-current" aria-hidden="true" />
            <span>Resume</span>
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#C49A6C] bg-white px-5 py-2.5 text-sm font-semibold text-[#1A2744] hover:bg-[#FCE7F3] cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Restart</span>
          </button>
          <button
            type="button"
            onClick={onTitle}
            className="w-full rounded-xl px-5 py-2 text-sm font-medium text-[#475569] hover:text-[#1A2744] cursor-pointer"
          >
            Back to Title
          </button>
        </div>
      </div>
    </div>
  );
};

interface EndModalProps {
  outcome: 'victory' | 'defeat';
  hud: HudSnapshot;
  onPlayAgain: () => void;
  onEndless?: () => void;
  onTitle: () => void;
}

export const EndModal: React.FC<EndModalProps> = ({
  outcome,
  hud,
  onPlayAgain,
  onEndless,
  onTitle,
}) => {
  const isVictory = outcome === 'victory';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="end-title"
      className="fixed inset-0 z-30 flex items-center justify-center bg-[#1A2744]/50 p-4"
    >
      <div className="w-full max-w-lg rounded-2xl border-2 border-[#C49A6C] bg-[#FFF8FB] p-6 sm:p-8 text-center shadow-2xl">
        {isVictory && (
          <img
            src="/src/assets/images/celebration_crest_1794628447287.jpg"
            alt="Pastel pink and bronze Ravenclaw celebration crest"
            referrerPolicy="no-referrer"
            className="mx-auto mb-4 h-28 w-28 rounded-full border-2 border-[#C49A6C] object-cover shadow-md"
          />
        )}

        <div className="text-xs font-bold uppercase tracking-wider text-[#BE185D]">
          {isVictory ? 'Grand Ravenclaw Celebration' : 'Owl Post Interrupted'}
        </div>

        <h2
          id="end-title"
          className="mt-1 font-display text-3xl sm:text-4xl font-bold text-[#1A2744]"
        >
          {isVictory
            ? 'All Blessings Gathered for Soren!'
            : 'Take Another Flight'}
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-[#475569]">
          {isVictory
            ? 'Every wax-sealed keepsake shines bright in honor of Genesias Evangelium Soren — wishing wisdom, warmth, and pastel starlight always.'
            : 'Mischievous ink blots ruffled Pip’s feathers, but the Ravenclaw tower sky is ready whenever you want to fly again.'}
        </p>

        {/* Tabular Metrics Strip */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-[#E6D0DC] bg-white px-3 py-2.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Score
            </div>
            <div className="mt-0.5 font-mono text-xl font-bold text-[#1A2744] tabular-nums">
              {hud.score}
            </div>
          </div>
          <div className="rounded-xl border border-[#E6D0DC] bg-white px-3 py-2.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Best
            </div>
            <div className="mt-0.5 font-mono text-xl font-bold text-[#1E3A8A] tabular-nums">
              {hud.bestScore}
            </div>
          </div>
          <div className="rounded-xl border border-[#E6D0DC] bg-white px-3 py-2.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Scrolls
            </div>
            <div className="mt-0.5 font-mono text-xl font-bold text-[#BE185D] tabular-nums">
              {hud.scrollsCollected}/{TOTAL_SCROLL_GOAL}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            data-start="true"
            onClick={onPlayAgain}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1E3A8A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#172D6E] cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>{isVictory ? 'Play Again' : 'Try Again'}</span>
          </button>

          {isVictory && onEndless && (
            <button
              type="button"
              onClick={onEndless}
              className="inline-flex items-center gap-2 rounded-xl border border-[#EC4899] bg-[#FCE7F3] px-5 py-3 text-sm font-semibold text-[#9D174D] hover:bg-[#FBCFE8] cursor-pointer"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>Endless Sky</span>
            </button>
          )}

          <button
            type="button"
            onClick={onTitle}
            className="rounded-xl border border-[#C49A6C] bg-white px-5 py-3 text-sm font-semibold text-[#1A2744] hover:bg-[#FCE7F3] cursor-pointer"
          >
            Title Screen
          </button>
        </div>
      </div>
    </div>
  );
};

interface KeepsakeAlbumModalProps {
  unlockedIds: number[];
  onClose: () => void;
}

export const KeepsakeAlbumModal: React.FC<KeepsakeAlbumModalProps> = ({
  unlockedIds,
  onClose,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="album-title"
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#1A2744]/50 p-4"
    >
      <div className="max-h-[86vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-2 border-[#C49A6C] bg-[#FFF8FB] p-6 sm:p-8 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#BE185D]">
              Dedicated to Genesias Evangelium Soren
            </div>
            <h2
              id="album-title"
              className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#1A2744]"
            >
              Ravenclaw Keepsake Album
            </h2>
          </div>

          <button
            type="button"
            aria-label="Close album"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#C49A6C] bg-white text-[#1A2744] hover:bg-[#FCE7F3] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TRIBUTE_BLESSINGS.map((b) => {
            const unlocked = unlockedIds.includes(b.id);
            return (
              <div
                key={b.id}
                className={`rounded-xl border p-4 ${
                  unlocked
                    ? 'border-[#EC4899]/50 bg-white'
                    : 'border-[#E2C9D6] bg-[#FAF0F5]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-base font-bold text-[#1A2744]">
                    {b.title}
                  </span>
                  {!unlocked && (
                    <Lock className="h-4 w-4 text-[#94A3B8]" aria-hidden="true" />
                  )}
                </div>
                <div className="mt-0.5 text-xs font-semibold text-[#BE185D]">
                  {b.virtue}
                </div>
                <p className="mt-2 text-sm leading-snug text-[#475569]">
                  {unlocked
                    ? b.message
                    : 'Catch a wax-sealed Celebration Scroll during flight to unlock this keepsake.'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
