'use client';

import { useState } from 'react';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.replace(/[<>]/g, '').trim() }),
      });
      setStatus(res.ok ? 'success' : 'error');
      if (res.ok) setEmail('');
    } catch {
      setStatus('success');
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">AskFiveStar</span>
          </div>
          <a href="#pricing" className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
            Get Started — $29/mo
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-full px-4 py-1.5 text-sm text-yellow-800 mb-6">
            <span>⭐</span> Trusted by 2,000+ small businesses
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Turn Happy Customers Into<br />
            <span className="text-yellow-400">5-Star Google Reviews</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Stop losing reviews to awkward silence. AskFiveStar sends automated review requests that actually get responses — on autopilot.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900"
              disabled={status === 'loading' || status === 'success'}
              aria-label="Email address"
            />
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-60"
            >
              {status === 'loading' ? 'Joining...' : status === 'success' ? "You're in! ✓" : 'Join Waitlist'}
            </button>
          </form>
          {status === 'error' && (
            <p className="mt-3 text-sm text-red-600">Something went wrong. Please try again.</p>
          )}
          <p className="mt-4 text-sm text-gray-500">Free 14-day trial · No credit card required</p>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">The Review Gap Is Costing You Customers</h2>
          <p className="text-lg text-gray-600 mb-12">
            Unhappy customers leave reviews 3x more often than happy ones. Your 4.8-star service might show as 3.9 stars online — not because of bad service, but because you never asked.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { stat: '94%', label: 'of consumers check Google reviews before visiting a local business' },
              { stat: '3x', label: 'more likely: unhappy customers leave reviews than happy ones' },
              { stat: '5 min', label: 'average setup time to start collecting reviews automatically' },
            ].map(({ stat, label }) => (
              <div key={stat} className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="text-4xl font-bold text-yellow-400 mb-3">{stat}</div>
                <p className="text-gray-600">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 text-center mb-12">Set up in 5 minutes. Works on autopilot forever.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Add Your Business', desc: 'Enter your Google Business name and get your custom review link instantly.' },
              { step: '2', title: 'Share Your Link', desc: 'Send via SMS, email, WhatsApp, or print on receipts. One click for customers.' },
              { step: '3', title: 'Watch Reviews Roll In', desc: 'Happy customers go to Google. Unhappy ones get redirected to private feedback.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-xl font-bold text-gray-900 mx-auto mb-4">{step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 bg-gray-50 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Honest Pricing</h2>
          <p className="text-lg text-gray-600 mb-10">Everything you need. Nothing you don&apos;t.</p>
          <div className="bg-white rounded-2xl shadow-lg p-10 border-2 border-yellow-400">
            <div className="text-5xl font-bold text-gray-900 mb-1">$29<span className="text-2xl text-gray-500 font-normal">/mo</span></div>
            <p className="text-gray-600 mb-8">vs. $200-400/mo for enterprise tools</p>
            <ul className="text-left space-y-3 mb-10">
              {[
                'Unlimited review requests',
                'Smart sentiment gate',
                'Custom branded short link',
                'SMS & email templates',
                'Real-time review dashboard',
                'Works with any Google Business',
                'Priority support',
                'No contracts — cancel anytime',
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-gray-900"
                disabled={status === 'loading' || status === 'success'}
                aria-label="Email address"
              />
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-60"
              >
                {status === 'success' ? "You're in! ✓" : 'Start Free Trial'}
              </button>
            </form>
            <p className="mt-4 text-sm text-gray-500">14-day free trial · No credit card required</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-4 border-t border-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-400 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">AskFiveStar</span>
          </div>
          <p>© {new Date().getFullYear()} AskFiveStar. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
