"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import LoadingSpinner from "../components/LoadingSpinner";

export default function LandingPage() {
  const { user, loading, signIn, isFirebaseConfigured } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState("");

  const previewThreads = [
    {
      author: "Ananya",
      title: "AI mock interviews for tier-2 college students",
      text: "Would students use this weekly, or only before placements?",
    },
    {
      author: "Rohit",
      title: "Shared EV delivery network for smaller cities",
      text: "Curious whether the hardest part is demand or fleet utilization.",
    },
    {
      author: "Mira",
      title: "PCOS support app with a private community layer",
      text: "Feels like trust and retention would drive everything here.",
    },
  ];

  const handleSignIn = async () => {
    setError("");
    setIsSigningIn(true);

    try {
      await signIn();
    } catch (signInError) {
      setError(signInError.message || "Google sign-in failed. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                IdeaThreads
              </span>
              <span>Ideas become live conversations.</span>
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Post an idea. Open a room. Let people talk.
            </h1>

            <p className="mt-4 max-w-2xl text-lg text-slate-600">
              A lightweight discussion space for ideathons, hackathons, and closed groups.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {!mounted || loading ? (
                <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600 shadow-sm">
                  <LoadingSpinner />
                  Checking your session
                </div>
              ) : user ? (
                <>
                  <Link href="/feed" className="button-primary">
                    Open feed
                  </Link>
                  <Link href="/idea/new" className="button-secondary">
                    Start a conversation
                  </Link>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isSigningIn || !isFirebaseConfigured}
                  className="button-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {!isFirebaseConfigured
                    ? "Configure Firebase to sign in"
                    : isSigningIn
                      ? "Signing in..."
                      : "Enter with Google"}
                </button>
              )}
            </div>

            {!isFirebaseConfigured ? (
              <p className="mt-4 text-sm font-medium text-amber-700">
                Add the Firebase values from `.env.local.example` to `.env.local`, then restart
                the dev server.
              </p>
            ) : null}

            {error ? <p className="mt-4 text-sm font-medium text-rose-600">{error}</p> : null}
          </div>

          <div className="space-y-4">
            {previewThreads.map((thread) => (
              <article
                key={thread.title}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    {thread.author.slice(0, 1)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-950">{thread.author}</p>
                    <p className="text-sm text-slate-500">started a room</p>
                  </div>
                </div>
                <h2 className="mt-4 text-xl font-semibold text-slate-950">{thread.title}</h2>
                <p className="mt-2 text-slate-600">{thread.text}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              How it works
            </p>
            <div className="mt-5 space-y-4 text-slate-700">
              <p>1. Start an idea room.</p>
              <p>2. People join the thread and reply in real time.</p>
              <p>3. The best ideas get sharper through conversation.</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
              Best for
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Ideathons", "Hackathons", "Student groups", "Founder circles"].map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
