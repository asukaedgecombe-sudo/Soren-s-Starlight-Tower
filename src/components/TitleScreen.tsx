import React from 'react';
import { BookOpen, Play } from 'lucide-react';

interface TitleScreenProps {
  bestScore: number;
  unlockedCount: number;
  totalBlessings: number;
  onStart: () => void;
  onOpenAlbum: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  bestScore,
  unlockedCount,
  totalBlessings,
  onStart,
  onOpenAlbum,
}) => {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#FCEBF4]">
      {/* Illustrated Key-Art Backdrop */}
      <img
        src="/src/assets/images/title_bg_1794628446879.jpg"
        alt="Pastel pink Ravenclaw tower conservatory balcony with snowy owl"
        referrerPolicy="no-referrer"
        className="absolute inset-0 h-full w-full object-cover object-right select-none pointer-events-none"
      />

      {/* Soft legibility veil over negative space (fuller on mobile, left-focused on desktop) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none bg-[#FFF5FA]/75 md:bg-transparent"
      />
      <div
        aria-hidden="true"
        className="hidden md:block absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(255, 245, 250, 0.92) 0%, rgba(255, 245, 250, 0.78) 42%, rgba(255, 245, 250, 0.08) 76%, rgba(255, 245, 250, 0) 100%)',
        }}
      />

      {/* Main Content Anchored in Left Negative Space */}
      <main className="relative z-10 flex h-full w-full flex-col justify-between px-6 py-8 md:px-14 md:py-12">
        <div className="my-auto max-w-xl">
          {/* Bespoke Inline SVG Pastel Ravenclaw Crest Emblem */}
          <div className="mb-5 flex items-center gap-4">
            <svg
              viewBox="0 0 64 64"
              className="h-14 w-14 shrink-0 drop-shadow-sm"
              aria-hidden="true"
            >
              <circle cx="32" cy="32" r="29" fill="#FFF7FA" stroke="#B8864B" strokeWidth="2.5" />
              <circle cx="32" cy="32" r="24" fill="#1E3A8A" stroke="#F472B6" strokeWidth="2" />
              {/* Stylized Eagle Wings */}
              <path
                d="M15 35 C18 24, 26 21, 32 25 C38 21, 46 24, 49 35 C43 32, 37 33, 32 42 C27 33, 21 32, 15 35 Z"
                fill="#FCE7F3"
                stroke="#F9A8D4"
                strokeWidth="1.5"
              />
              {/* Star above eagle */}
              <path
                d="M32 13 L34 19 L40 21 L34 23 L32 29 L30 23 L24 21 L30 19 Z"
                fill="#FDE68A"
              />
              {/* Wax seal ribbon bow at base */}
              <circle cx="32" cy="46" r="5" fill="#EC4899" stroke="#FFF7FA" strokeWidth="1.5" />
            </svg>

            <div className="text-sm font-medium tracking-wide text-[#5B3A63]">
              Ravenclaw Owl Post · Celebration Edition
            </div>
          </div>

          <h1
            className="font-display text-4xl font-bold tracking-tight text-[#1A2744] sm:text-5xl md:text-6xl leading-[1.08]"
            style={{ textWrap: 'balance' }}
          >
            Celebrating{' '}
            <span className="italic text-[#BE185D]">Genesias Evangelium Soren</span>
          </h1>

          <p className="mt-4 max-w-md text-base leading-relaxed text-[#334155]">
            Guide Pip across the pastel Ravenclaw balcony to gather sapphires, rose macarons, and
            six wax-sealed keepsake scrolls dedicated to Soren.
          </p>

          {/* Actions (<= 3 total) */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              data-start="true"
              onClick={onStart}
              className="inline-flex items-center gap-2.5 rounded-xl bg-[#1E3A8A] px-6 py-3.5 text-base font-semibold text-white shadow-[0_6px_20px_rgba(30,58,138,0.28)] transition-transform duration-150 hover:bg-[#172D6E] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#BE185D] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-current" aria-hidden="true" />
              <span>Start Celebration</span>
            </button>

            <button
              type="button"
              onClick={onOpenAlbum}
              className="inline-flex items-center gap-2 rounded-xl border border-[#C49A6C] bg-[#FFF8FB] px-5 py-3.5 text-sm font-semibold text-[#1A2744] transition-colors duration-150 hover:bg-[#FCE7F3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A8A] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <BookOpen className="h-4 w-4 text-[#BE185D]" aria-hidden="true" />
              <span>
                Keepsakes ({unlockedCount}/{totalBlessings})
              </span>
            </button>
          </div>

          {bestScore > 0 && (
            <p className="mt-4 text-sm font-medium text-[#475569] tabular-nums">
              Tower High Score: <span className="font-mono font-bold text-[#1A2744]">{bestScore}</span>
            </p>
          )}
        </div>

        {/* Flat, Borderless Single-Line Control Hint */}
        <footer className="text-xs sm:text-sm font-medium text-[#475569]">
          A / D or Arrow Keys Move · Space Feather Dash · P Pause · M Mute
        </footer>
      </main>
    </div>
  );
};
