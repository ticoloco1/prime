'use client';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/store/cart';
import { useTheme } from '@/store/theme';
import { ShoppingCart, Sun, Moon, Home, Car, Briefcase, Crown } from 'lucide-react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { SlugTicker } from '@/components/ui/SlugTicker';
import { useTranslation } from 'react-i18next';

export function Header() {
  const { user, signOut } = useAuth();
  const { items, open } = useCart();
  const { dark, toggle } = useTheme();
  const { t } = useTranslation();

  const NAV = [
    { href: '/imoveis', icon: Home, label: t('nav.properties') },
    { href: '/carros', icon: Car, label: t('nav.cars') },
    { href: '/slugs', icon: Crown, label: t('nav.slugs') },
    { href: '/planos', icon: Briefcase, label: t('nav.plans') },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <span className="text-white font-black text-sm">T</span>
            </div>
            <span className="font-black text-lg text-[var(--text)]">TrustBank</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[var(--text2)] hover:text-[var(--text)] hover:bg-[var(--bg2)] transition-all">
                <Icon className="w-3.5 h-3.5" /> {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={toggle}
              className="p-2 rounded-lg hover:bg-[var(--bg2)] text-[var(--text2)] hover:text-[var(--text)] transition-all">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button onClick={open}
              className="relative p-2 rounded-lg hover:bg-[var(--bg2)] text-[var(--text2)] hover:text-[var(--text)] transition-all">
              <ShoppingCart className="w-4 h-4" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </button>

            <LanguageSwitcher />

            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/editor" className="btn-primary text-xs px-3 py-1.5">{t('nav.editor')}</Link>
                <button onClick={signOut} className="text-xs text-[var(--text2)] hover:text-[var(--text)] px-2 py-1.5">Out</button>
              </div>
            ) : (
              <Link href="/auth" className="btn-primary text-xs px-3 py-1.5">{t('nav.signIn')}</Link>
            )}
          </div>
        </div>
      </header>
      <SlugTicker />
    </>
  );
}
