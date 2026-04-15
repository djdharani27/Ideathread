"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import IdeaForm from "../../../components/IdeaForm";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { useAuth } from "../../../components/AuthProvider";
import { createIdea } from "../../../lib/firestore";

function NewIdeaContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError("");

    try {
      await createIdea(user, values);
      router.push("/feed");
    } catch (submitError) {
      setError(submitError.message || "Failed to create the room.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
          New room
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Start a conversation
        </h1>
        <p className="mt-2 text-slate-600">
          Keep it lightweight. Give the idea a title and enough context for people to jump in.
        </p>
      </div>

      <IdeaForm onSubmit={handleSubmit} isSubmitting={submitting} errorMessage={error} />
    </section>
  );
}

export default function NewIdeaPage() {
  return (
    <ProtectedRoute>
      <NewIdeaContent />
    </ProtectedRoute>
  );
}
