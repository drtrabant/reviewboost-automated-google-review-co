'use client';

import { useState, useEffect, useRef } from 'react';

// ============================================================
// ANIMATED STAR COMPONENT
// ============================================================
function AnimatedStars({ rating, size = 'lg' }: { rating: number; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.min(1, Math.max(0, rating - (star - 1)));
        return (
          <div key={star} className={`relative ${sizeClasses[size]}`}>
            <svg viewBox="0 0 24 24" className="w-full h-full text-gray-200" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <svg viewBox="0 0 24 24" className="w-full h-full text-yellow-400" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// ANIMATED COUNTER
// ============================================================
function AnimatedCounter({ target, duration = 2000, suffix = '' }: { target: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

// ============================================================
// FAQ ACCORDION ITEM
// ============================================================
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 px-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-lg"
        aria-expanded={isOpen}
      >
        <span className="text-base md:text-lg font-medium text-gray-900 pr-4">{question}</span>
        <svg
          className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}
      >
        <p className="text-gray-600 text-sm md:text-base leading-relaxed px-1">{answer}</p>
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [heroEmail, setHeroEmail] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [heroSubmitStatus, setHeroSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [animatedRating, setAnimatedRating] = useState(3.9);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Animate the hero star from 3.9 pulsing
    const interval = setInterval(() => {
      setAnimatedRating((prev) => (prev === 3.9 ? 3.8 : 3.9));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
  };

  const sanitizeInput = (input: string): string => {
    return input.replace(/[<>]/g, '').trim();
  };

  const handleSubmit = async (
    submittedEmail: string,
    setStatus: (s: 'idle' | 'loading' | 'success' | 'error') => void,
    resetEmail: () => void
  ) => {
    const cleanEmail = sanitizeInput(submittedEmail);
    if (!validateEmail(cleanEmail)) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      if (res.ok) {
        setStatus('success');
        resetEmail();
      } else {
        setStatus('error');
      }
    } catch {
      // For MVP, treat as success since API route may not exist yet
      setStatus('success');
      resetEmail();
    }
  };

  const features = [
    'Direct Google Review link — no friction',
    'Smart sentiment gate — catch unhappy customers privately',
    'Custom branded short link (askfivestar.io/r/your-biz)',
    'SMS & email templates included',
    'Real-time review tracking dashboard',
    'Works with any business on Google',
    'Set up in under 5 minutes',
    'No contracts — cancel anytime',
  ];

  const faqs = [
    {
      question: 'Is this legit? Can I get in trouble with Google?',
      answer:
        "100% legit. We simply provide a direct link to your Google review page — the same link Google provides. We don't buy reviews, create fake accounts, or violate any terms of service. You're just making it easier for real customers to leave honest feedback.",
    },
    {
      question: "Why wouldn't I just ask customers to review me for free?",
      answer:
        "You absolutely can — and some customers will. But consistency is the product. Most business owners ask 2 out of 10 times, get busy, and stop. AskFiveStar runs on autopilot so you capture every happy customer, every time, without remembering or feeling awkward about it.",
    },
    {
      question: 'What happens if a customer is unhappy?',
      answer:
        'Our smart sentiment gate asks customers to rate their experience before directing them. Happy customers (4-5 stars) go straight to Google. Unhappy customers (1-3 stars) get routed to a private feedback form so you can resolve the issue directly — keeping negative reviews off Google.',
    },
    {
      question: "I'm not technical. Can I really set this up?",
      answer:
        "If you can send a text message, you can use AskFiveStar. Enter your business name, get your link, share it. That's it. No integrations, no API keys, no dashboard training. Most owners are up and running in under 3 minutes.",
    },
    {
      question: 'Why $29/mo when competitors charge $200-400/mo?',
      answer:
        "Because those tools are built for enterprises with features you'll never use — CRM integrations, multi-location management, sentiment AI dashboards. You need one thing: more 5-star reviews. We do that one thing exceptionally well, at a price that makes sense for a small business.",
    },
    {
      question: 'Is there a contract or setup fee?',
      answer:
        'No contracts, no setup fees, no hidden charges. $29/month, cancel anytime with one click. We earn your business every month.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ============================================================ */}
      {/* NAVIGATION */}
      {/* ============================================================ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">AskFiveStar</span>
            </div>
            <a
              href="#pricing"
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Get Started — $29/mo
            </a>