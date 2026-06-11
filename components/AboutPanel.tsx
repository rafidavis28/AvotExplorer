"use client";

export function AboutPanel({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-night-deep/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="About Avot Explorer"
        onClick={(e) => e.stopPropagation()}
        className="vellum animate-panel-in scroll-vellum max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-vellum-edge p-6 shadow-2xl shadow-black/60 sm:p-8"
      >
        <div className="flex items-start justify-between">
          <h2 className="font-display text-3xl font-bold text-ink">About this map</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close about panel"
            className="rounded-full px-2 font-display text-2xl leading-none text-ink-soft transition-colors hover:text-ink"
          >
            ×
          </button>
        </div>
        <div className="rule-gold mt-3" />

        <div className="mt-4 space-y-3 leading-relaxed text-ink-soft">
          <p>
            <strong className="text-ink">Pirkei Avot</strong> — the Ethics of the Fathers — is
            the Mishnah&rsquo;s tractate of wisdom: 108 teachings handed from Sinai through the
            sages. This explorer lays them out as a night sky. Every{" "}
            <strong className="text-ink">star is a teaching</strong>; every{" "}
            <strong className="text-ink">amber orb is a theme</strong> that binds teachings
            together, sized by how many it gathers.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Tap a star to read it — Hebrew, English, and classical commentary.</li>
            <li>Tap a theme to gather every teaching that expresses it.</li>
            <li>Tap a sage&rsquo;s name to gather everything they say in the tractate.</li>
            <li>
              Use <span className="font-display">←</span> / <span className="font-display">→</span>{" "}
              to walk the teachings in order, and <span className="font-display">Esc</span> to step back.
            </li>
            <li>Every view has a shareable URL.</li>
          </ul>
        </div>

        <h3 className="mt-6 font-display text-xs uppercase tracking-[0.22em] text-gold-dim">
          Sources
        </h3>
        <div className="mt-2 space-y-2 text-sm leading-relaxed text-ink-soft">
          <p>
            Hebrew text, English translation (Dr. Joshua Kulp&rsquo;s Mishnah Yomit, CC-BY), and
            the commentaries of <em>Bartenura</em>, <em>Rambam</em>, <em>Rabbeinu Yonah</em>, and{" "}
            <em>Tiferet Yisrael (Yachin)</em> are sourced from{" "}
            <a
              href="https://www.sefaria.org/Pirkei_Avot"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ink underline decoration-gold/50 underline-offset-2 hover:text-gold-dim"
            >
              Sefaria
            </a>{" "}
            via the Sefaria-Export dataset.
          </p>
          <p>
            Theme connections and sage attributions are this project&rsquo;s own curation — a
            study aid, not a ruling. Learn the sources themselves.
          </p>
        </div>
      </section>
    </div>
  );
}
