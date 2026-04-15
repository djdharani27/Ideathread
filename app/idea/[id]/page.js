"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import EmptyState from "../../../components/EmptyState";
import LoadingSpinner from "../../../components/LoadingSpinner";
import MessageBubble from "../../../components/MessageBubble";
import MessageComposer from "../../../components/MessageComposer";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { useAuth } from "../../../components/AuthProvider";
import { useToast } from "../../../components/ToastProvider";
import {
  createMessage,
  listenToIdea,
  listenToMessagesForIdea,
  markNotificationsAsReadForIdea,
} from "../../../lib/firestore";
import { getInitials, getTimestampLabel } from "../../../lib/utils";

function IdeaRoomContent() {
  const params = useParams();
  const ideaId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAuth();
  const { showToast } = useToast();
  const [idea, setIdea] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingIdea, setLoadingIdea] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!ideaId) {
      return undefined;
    }

    const unsubscribeIdea = listenToIdea(
      ideaId,
      (nextIdea) => {
        setIdea(nextIdea);
        setLoadingIdea(false);
      },
      (ideaError) => {
        setPageError(ideaError.message || "Failed to load this room.");
        setLoadingIdea(false);
      },
    );

    const unsubscribeMessages = listenToMessagesForIdea(
      ideaId,
      (nextMessages) => {
        setMessages(nextMessages);
        setLoadingMessages(false);
      },
      (messagesError) => {
        setPageError(messagesError.message || "Failed to load messages.");
        setLoadingMessages(false);
      },
    );

    return () => {
      unsubscribeIdea();
      unsubscribeMessages();
    };
  }, [ideaId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    if (!user?.uid || !ideaId || !idea?.userId || idea.userId !== user.uid) {
      return;
    }

    markNotificationsAsReadForIdea(user.uid, ideaId).catch((readError) => {
      console.error("Failed to mark notifications as read", readError);
    });
  }, [idea?.userId, ideaId, user?.uid]);

  const isLoading = loadingIdea || loadingMessages;
  const orderedMessages = useMemo(() => messages, [messages]);

  const handleMessageSubmit = async (text) => {
    if (!idea) {
      return false;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      await createMessage(user, idea.id, text);
      showToast("Reply sent.");
      return true;
    } catch (submitError) {
      const message = submitError.message || "Failed to send reply.";
      setSubmitError(message);
      showToast(message, "error");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4 py-8">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-600 shadow-sm">
          <LoadingSpinner />
          Loading room
        </div>
      </section>
    );
  }

  if (!idea) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-8">
        <EmptyState
          title="Room not found"
          description="This idea room may have been removed or the link is invalid."
          actionHref="/feed"
          actionLabel="Back to feed"
        />
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-0 pb-10">
      <div className="border-x border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-5 sm:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{idea.title}</h1>
              <p className="mt-3 text-sm text-slate-500">
                Started by {idea.authorName} • {getTimestampLabel(idea.createdAt)}
              </p>
            </div>
            <Link href="/feed" className="button-secondary">
              Back to feed
            </Link>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-3xl bg-slate-50 p-4">
            {idea.authorPhotoURL ? (
              <Image
                src={idea.authorPhotoURL}
                alt={idea.authorName}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {getInitials(idea.authorName)}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-medium text-slate-900">{idea.authorName}</p>
              <p className="text-sm text-slate-500">{idea.authorEmail || "Event participant"}</p>
            </div>
          </div>

          <p className="mt-5 whitespace-pre-line text-[15px] leading-7 text-slate-700">
            {idea.description || idea.problem}
          </p>
        </div>

        {pageError ? (
          <div className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 sm:px-5">
            {pageError}
          </div>
        ) : null}

        <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-5">
          <h2 className="text-xl font-semibold text-slate-950">Conversation</h2>
          <p className="mt-1 text-sm text-slate-600">
            {orderedMessages.length
              ? `${orderedMessages.length} replies in this room.`
              : "No replies yet. Start the conversation."}
          </p>
        </div>

        {orderedMessages.length ? (
          <div>
            {orderedMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={message.userId === user.uid}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        ) : (
          <div className="p-4 sm:p-5">
            <EmptyState
              title="No replies yet"
              description="Be the first person to reply in this room."
            />
          </div>
        )}

        <MessageComposer
          onSubmit={handleMessageSubmit}
          isSubmitting={submitting}
          errorMessage={submitError}
          placeholder="Jump into the discussion..."
          buttonLabel="Reply"
        />
      </div>
    </section>
  );
}

export default function IdeaRoomPage() {
  return (
    <ProtectedRoute>
      <IdeaRoomContent />
    </ProtectedRoute>
  );
}
