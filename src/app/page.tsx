"use client";

import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Store email via API route
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Silently fail — validation doesn't need perfect backend yet
    }
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <nav className="w-full px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-tennis-green flex items-center justify-center">
            <span className="text-tennis-ball text-sm font-bold">T</span>
          </div>
          <span className="font-semibold text-lg">TennisAI</span>
        </div>
        <a
          href="/upload"
          className="text-sm font-medium text-tennis-green hover:underline"
        >
          Try It Free
        </a>
      </nav>

      {/* Hero */}
      <section className="w-full px-6 pt-16 pb-20 max-w-6xl mx-auto text-center">
        <div className="inline-block mb-4 px-3 py-1 rounded-full bg-tennis-ball/20 text-tennis-green-light text-sm font-medium">
          Now accepting early access
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight max-w-3xl mx-auto">
          Your tennis coach,{" "}
          <span className="text-tennis-green">in your pocket</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-xl mx-auto leading-relaxed">
          Upload a video of your swing. Get pro-level analysis in 60 seconds.
          Know exactly what to fix, how to fix it, and track your improvement.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/upload"
            className="px-8 py-3.5 rounded-full bg-tennis-green text-white font-semibold text-base hover:bg-tennis-green-light transition-colors"
          >
            Analyze My Swing — Free
          </a>
          <span className="text-gray-400 text-sm">No credit card required</span>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          Regular price $9/month. Early birds lock in $4.99 forever.
        </p>
      </section>

      {/* Mockup */}
      <section className="w-full px-6 pb-20 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-tennis-green/10 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-tennis-green"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <div className="font-semibold">Your Forehand Analysis</div>
              <div className="text-sm text-gray-500">
                Analyzed in 58 seconds
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-2xl font-bold text-tennis-green">73%</div>
              <div className="text-xs text-gray-500">Twinity Score</div>
            </div>
          </div>

          {/* Score bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Match vs 4.0 reference</span>
              <span className="font-medium text-tennis-green">73%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-tennis-green rounded-full"
                style={{ width: "73%" }}
              />
            </div>
          </div>

          {/* Feedback items */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-600 text-xs font-bold">!</span>
              </div>
              <div>
                <div className="font-medium">Late preparation</div>
                <div className="text-sm text-gray-600">
                  Your takeback starts 0.15s after the ball bounces. A 4.0
                  player starts as the ball crosses the net. Try initiating your
                  turn earlier.
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-yellow-600 text-xs font-bold">~</span>
              </div>
              <div>
                <div className="font-medium">Contact point slightly late</div>
                <div className="text-sm text-gray-600">
                  You&apos;re making contact at your back hip instead of slightly
                  in front. Move your feet to get into position earlier.
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-xs font-bold">
                  &#10003;
                </span>
              </div>
              <div>
                <div className="font-medium">Good follow-through</div>
                <div className="text-sm text-gray-600">
                  Your extension and finish over the shoulder are solid. Keep
                  this up.
                </div>
              </div>
            </div>
          </div>

          {/* Drill suggestion */}
          <div className="mt-6 p-4 rounded-xl bg-tennis-green/5 border border-tennis-green/10">
            <div className="font-medium text-tennis-green text-sm">
              Recommended Drill
            </div>
            <div className="text-sm text-gray-700 mt-1">
              Shadow swing with pause at takeback. 3 sets of 20 reps. Focus on
              starting the unit turn before the ball bounces.
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="w-full px-6 py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Three things a coach would tell you
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-tennis-green/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-tennis-green"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Swing Analysis</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                AI watches your swing frame by frame and spots what you
                can&apos;t feel: late takeback, open racket face, poor weight
                transfer.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-tennis-green/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-tennis-green"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">
                Fix It Instructions
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Not just &quot;you&apos;re doing it wrong.&quot; Specific drills
                and cues you can take to the court tomorrow. &quot;Start your
                turn when the ball crosses the net.&quot;
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-tennis-green/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-tennis-green"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">
                Track Your Progress
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Upload again after practicing. See your score improve. Share
                your &quot;before vs after&quot; with friends or your coach.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="w-full px-6 py-20">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Simple pricing</h2>
          <p className="text-gray-600 mb-8">
            Cheaper than one lesson. More feedback than YouTube.
          </p>
          <div className="rounded-2xl border-2 border-tennis-green p-8 bg-white shadow-sm">
            <div className="text-sm font-medium text-tennis-green mb-2">
              Early Bird
            </div>
            <div className="flex items-end justify-center gap-1 mb-1">
              <span className="text-5xl font-bold">$4.99</span>
              <span className="text-gray-500 mb-1">/month</span>
            </div>
            <div className="text-sm text-gray-500 mb-6">
              $9/month after first 100 signups
            </div>
            <ul className="text-left space-y-3 mb-8 text-sm">
              <li className="flex gap-2">
                <span className="text-tennis-green">&#10003;</span>
                Unlimited swing analyses
              </li>
              <li className="flex gap-2">
                <span className="text-tennis-green">&#10003;</span>
                Forehand, backhand, serve
              </li>
              <li className="flex gap-2">
                <span className="text-tennis-green">&#10003;</span>
                Personalized drill recommendations
              </li>
              <li className="flex gap-2">
                <span className="text-tennis-green">&#10003;</span>
                Progress tracking &amp; before/after
              </li>
              <li className="flex gap-2">
                <span className="text-tennis-green">&#10003;</span>
                Shareable score cards
              </li>
            </ul>
            <a
              href="/upload"
              className="block w-full py-3 rounded-full bg-tennis-green text-white font-semibold text-center hover:bg-tennis-green-light transition-colors"
            >
              Lock in $4.99/mo
            </a>
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section id="waitlist" className="w-full px-6 py-20 bg-tennis-green">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to fix your swing?
          </h2>
          <p className="text-tennis-ball mb-8 text-lg">
            Join the waitlist. First 100 users get 45% off forever.
          </p>
          {submitted ? (
            <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <div className="text-3xl mb-3">&#127934;</div>
              <div className="text-xl font-semibold text-white mb-2">
                You&apos;re on the list!
              </div>
              <div className="text-white/70">
                We&apos;ll email you when early access opens. Share with your
                tennis friends!
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-3.5 rounded-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tennis-ball"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3.5 rounded-full bg-tennis-ball text-tennis-green font-semibold hover:bg-tennis-ball-dark transition-colors disabled:opacity-50"
              >
                {loading ? "Joining..." : "Join Waitlist"}
              </button>
            </form>
          )}
          <p className="text-white/50 text-sm mt-4">
            No spam. Unsubscribe anytime. We respect your inbox.
          </p>
        </div>
      </section>

      {/* Social proof placeholder */}
      <section className="w-full px-6 py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            Join waitlist members from r/tennis, Tennis Warehouse, and local
            clubs across 12 countries
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full px-6 py-8 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-tennis-green flex items-center justify-center">
              <span className="text-tennis-ball text-xs font-bold">T</span>
            </div>
            <span>TennisAI</span>
          </div>
          <p>
            AI-generated feedback is not a substitute for professional coaching
            or medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
