"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../components/AuthProvider";
import { listenToIdeas, listenToMessages } from "../../lib/firestore";
import { buildMessageCountMap, getTimestampLabel, truncate } from "../../lib/utils";

function DashboardContent() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribeIdeas = listenToIdeas(
      (nextIdeas) => {
        setIdeas(nextIdeas.filter((idea) => idea.userId === user.uid));
        setLoadingIdeas(false);
      },
      (ideasError) => {
        setError(ideasError.message || "Failed to load your ideas.");
        setLoadingIdeas(false);
      },
    );

    const unsubscribeMessages = listenToMessages(
      (nextMessages) => {
        setMessages(nextMessages);
        setLoadingMessages(false);
      },
      (messagesError) => {
        setError(messagesError.message || "Failed to load messages.");
        setLoadingMessages(false);
      },
    );

    return () => {
      unsubscribeIdeas();
      unsubscribeMessages();
    };
  }, [user.uid]);

  const replyCountMap = useMemo(() => buildMessageCountMap(messages), [messages]);
  const isLoading = loadingIdeas || loadingMessages;

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            My ideas
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Rooms you started
          </h1>
          <p className="mt-2 text-slate-600">
            Jump back into your conversations and see where people are replying.
          </p>
        </div>
        <Link href="/idea/new" className="button-primary">
          Start a new room
        </Link>
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 text-slate-600">
            <LoadingSpinner />
            Loading your rooms
          </div>
        </div>
      ) : ideas.length ? (
        <div className="grid gap-5">
          {ideas.map((idea) => (
            <article
              key={idea.id}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-950">{idea.title}</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Started {getTimestampLabel(idea.createdAt)}
                  </p>
                  <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-700">
                    {truncate(idea.description || idea.problem, 240)}
                  </p>
                </div>
                <Link href={`/idea/${idea.id}`} className="button-secondary">
                  Open room
                </Link>
              </div>

              <div className="mt-5 inline-flex items-center rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                {replyCountMap[idea.id] || 0} replies
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="You have not started any rooms yet"
          description="Create your first idea room and let people join the conversation."
          actionHref="/idea/new"
          actionLabel="Start your first room"
        />
      )}
    </section>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
