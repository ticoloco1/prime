import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Crown, Play, Home, Car, FileText, Users, Zap, Globe } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Header />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 text-brand text-xs font-semibold mb-6">
          <Zap className="w-3 h-3" /> Mini Sites + Video Paywall + Slug Marketplace
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-[var(--text)] leading-tight mb-6">
          Your identity.<br />
          <span className="text-brand">Your brand.</span>
        </h1>
        <p className="text-xl text-[var(--text2)] max-w-2xl mx-auto mb-10">
          Create a beautiful mini site, claim your slug, monetize YouTube videos with USDC paywall, and list properties or cars.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/auth" className="btn-primary px-8 py-3 text-base">
            Get Started Free
          </Link>
          <Link href="/slugs" className="btn-secondary px-8 py-3 text-base">
            Browse Slugs
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Globe, title: 'Mini Site', desc: 'Beautiful profile page with links, bio, videos, CV and carousel photos.' },
            { icon: Crown, title: 'Slug Marketplace', desc: 'Claim your name. Short slugs like /ceo or /art are premium assets.' },
            { icon: Play, title: 'YouTube Paywall', desc: 'Set a USDC price for your YouTube videos. Fans pay to watch.' },
            { icon: Home, title: 'Properties', desc: 'List properties with 10-photo carousel. Reach independent buyers.' },
            { icon: Car, title: 'Cars', desc: 'Sell vehicles with full specs, photos and direct contact.' },
            { icon: FileText, title: 'CV Unlock', desc: 'Companies pay USDC to unlock your contact info. You earn 60%.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6 hover:border-brand/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-brand" />
              </div>
              <h3 className="font-bold text-[var(--text)] mb-2">{title}</h3>
              <p className="text-sm text-[var(--text2)]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-black text-[var(--text)] mb-4">Ready to start?</h2>
        <p className="text-[var(--text2)] mb-8">Create your mini site in 2 minutes. No credit card required.</p>
        <Link href="/auth" className="btn-primary px-10 py-4 text-base">
          Create Your Site →
        </Link>
      </section>

      <footer className="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--text2)]">
        © 2025 TrustBank — Mini Sites & Slug Marketplace
      </footer>
    </div>
  );
}
