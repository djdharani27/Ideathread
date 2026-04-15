"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import EmptyState from "../../components/EmptyState";
import IdeaCard from "../../components/IdeaCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../components/AuthProvider";
import { listenToIdeas, listenToMessages } from "../../lib/firestore";
import { buildMessageCountMap, filterIdeas } from "../../lib/utils";

function FeedContent() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribeIdeas = listenToIdeas(
      (nextIdeas) => {
        setIdeas(nextIdeas);
        setLoadingIdeas(false);
      },
      (ideasError) => {
        setError(ideasError.message || "Failed to load ideas.");
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
  }, []);

  const replyCountMap = useMemo(() => buildMessageCountMap(messages), [messages]);
  const ideasWithCounts = useMemo(
    () =>
      ideas.map((idea) => ({
        ...idea,
        replyCount: replyCountMap[idea.id] || 0,
      })),
    [ideas, replyCountMap],
  );
  const filteredIdeas = useMemo(
    () => filterIdeas(ideasWithCounts, searchTerm, selectedFilter),
    [ideasWithCounts, searchTerm, selectedFilter],
  );
  const isLoading = loadingIdeas || loadingMessages;

  return (
    <section className="mx-auto w-full max-w-3xl px-0 pb-10">
      <div className="border-x border-slate-200 bg-white">
        <div className="sticky top-[76px] z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-slate-950">Idea feed</h1>
              <p className="text-sm text-slate-500">Rooms people are actively talking in.</p>
            </div>
            <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-950">
              My ideas
            </Link>
          </div>

          <div className="mt-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search rooms"
              className="input-field"
            />
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {["All", "Active", "Quiet"].map((filter) => {
              const active = selectedFilter === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSelectedFilter(filter)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {ideas.length} rooms · {messages.length} replies
            </p>
            <Link href="/idea/new" className="button-primary px-4 py-2.5 text-sm">
              Start a conversation
            </Link>
          </div>
        </div>

        {error ? (
          <div className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 sm:px-5">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center px-4 py-10 sm:px-5">
            <div className="flex items-center gap-3 text-slate-600">
              <LoadingSpinner />
              Loading rooms
            </div>
          </div>
        ) : filteredIdeas.length ? (
          <div>
            {filteredIdeas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                replyCount={idea.replyCount}
                isOwnIdea={idea.userId === user.uid}
              />
            ))}
          </div>
        ) : (
          <div className="p-4 sm:p-5">
            <EmptyState
              title={ideas.length ? "No rooms match that search" : "No conversations yet"}
              description={
                ideas.length
                  ? "Try a different search or switch filters."
                  : "Start the first room and get people talking."
              }
              actionHref="/idea/new"
              actionLabel="Start the first conversation"
            />
          </div>
        )}
      </div>
    </section>
  );
}

export default function FeedPage() {
  return (
    <ProtectedRoute>
      <FeedContent />
    </ProtectedRoute>
  );
}
