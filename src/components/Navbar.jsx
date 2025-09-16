// src/components/Navbar.jsx (GLASS CAPSULE – keep Roku logo, smaller logo & CTA)

import React from 'react';

const navItems = [
  { name: 'Works', href: '#' },
  { name: 'About', href: '#' },
  { name: 'Journal', href: '#', hasIcon: true },
];

const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
       strokeWidth={2} stroke="currentColor" className="w-3 h-3 ml-1">
    <path strokeLinecap="round" strokeLinejoin="round"
          d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
  </svg>
);

export default function Navbar() {
  return (
    <header
  className="fixed left-0 w-full flex justify-center px-4 z-50"
  style={{ top: 'calc(env(safe-area-inset-top, 0px) + clamp(8px, 3vw, 48px))' }}
>
      <nav aria-label="Main" className="relative group">
        {/* soft outer glow */}
        <div className="pointer-events-none absolute -inset-[2px] rounded-[22px] bg-gradient-to-br from-white/40 via-white/10 to-transparent opacity-60 blur-md" />
        {/* subtle outer outline */}
        <div className="pointer-events-none absolute -inset-px rounded-[20px] border border-white/25 opacity-70" />

        {/* main glass bar (semua custom kamu dipertahankan) */}
       <div
  className="
    relative rounded-[12px] px-4
    py-2.5 sm:py-3 md:py-3.5            /* ↑ kapsul lebih tinggi & responsif */
    min-h-[44px] sm:min-h-[52px] md:min-h-[58px]  /* guard tinggi minimum */
    min-w-[560px]                        /* (catatan: pastikan bracketnya benar) */
    flex items-center gap-6
    border border-white/20
    bg-white/10 backdrop-blur-xl
    text-gray/90
    shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_24px_-12px_rgba(0,0,0,0.2)]
  "
>

          {/* Logo kiri – DIPERKECIL */}
          <a href="#" className="flex items-center gap-2 font-medium">
            <img
              src="/logos/logo_roku_mark.svg"
              alt="Roku Logo"
              className="h-4 relative top-[2px]" /* was h-5 */
            />
            <span className="hidden sm:inline text-[0.95rem] leading-none">
              roku studio
            </span>
          </a>

          {/* hairline divider */}
            <span className="h-6 w-px bg-zinc-300/70" />

          {/* Nav items */}
          <div className="hidden md:flex items-center gap-6">
            {/* Works */}
            <a href={navItems[0].href} className="px-2 py-1 rounded-md hover:bg-white/10 transition text-sm">
              {navItems[0].name}
            </a>

            {/* hairline divider */}
            <span className="h-6 w-px bg-zinc-300/70" />

            {/* About */}
            <a href={navItems[1].href} className="px-2 py-1 rounded-md hover:bg-white/10 transition text-sm">
              {navItems[1].name}
            </a>

            {/* hairline divider */}
            <span className="h-6 w-px bg-zinc-300/70" />

            {/* Journal (+icon) */}
            <a href={navItems[2].href} className="px-2 py-1 rounded-md hover:bg-white/10 transition text-sm flex items-center">
              {navItems[2].name}
              {navItems[2].hasIcon && <ArrowIcon />}
            </a>
          </div>

          {/* spacer */}
          <div className="flex-1" />

          {/* CTA kanan – DIPERKECIL (ukuran font & padding) */}
          {/* CTA kanan — lebih besar (font tetap sama dgn item lain) */}
<a
  href="#contact"
  className="
    relative isolate inline-flex items-center gap-2
    rounded-[8px]
    px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3   /* ⇦ naikkan padding responsif */
    text-sm font-medium
    text-grey bg-white/20 border border-white/30
    backdrop-blur-xl
    shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_10px_24px_-10px_rgba(0,0,0,0.2)]
    hover:bg-white/25 hover:border-white/40 transition
    leading-none
  "
>
  <span>Contact</span>
  <span aria-hidden>→</span>

  {/* inner gloss rings – tetap sinkron dgn rounded 8px */}
  <span className="pointer-events-none absolute inset-0 rounded-[8px] ring-1 ring-white/20" />
  <span className="pointer-events-none absolute -inset-[2px] rounded-[10px] bg-gradient-to-br from-white/50 via-white/10 to-transparent opacity-40 blur-sm" />
</a>

        </div>
      </nav>
    </header>
  );
}
