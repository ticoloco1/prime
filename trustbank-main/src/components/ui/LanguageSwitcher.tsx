'use client';
import '@/lib/i18n';
import { useState, useRef, useEffect } from 'react';
import { LANGUAGES } from '@/lib/i18n';
import { ChevronDown } from 'lucide-react';

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(LANGUAGES[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('i18n-lang');
    if (saved) {
      const found = LANGUAGES.find(l => l.code === saved);
      if (found) setCurrent(found);
    }
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const changeLang = (lang: typeof LANGUAGES[0]) => {
    setCurrent(lang);
    localStorage.setItem('i18n-lang', lang.code);
    // Dynamically update i18n language
    import('@/lib/i18n').then(({ i18n }) => i18n.changeLanguage(lang.code));
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg2)] transition-all border border-[var(--border)]">
        <span>{current.flag}</span>
        <span className="hidden sm:block">{current.code.toUpperCase()}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl z-[300] py-1 min-w-[150px]">
          {LANGUAGES.map(lang => (
            <button key={lang.code} onClick={() => changeLang(lang)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-[var(--bg2)] transition-colors text-left ${current.code === lang.code ? 'font-black text-brand' : 'text-[var(--text)]'}`}>
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
              {current.code === lang.code && <span className="ml-auto text-brand text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
