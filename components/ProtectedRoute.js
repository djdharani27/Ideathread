"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import LoadingSpinner from "./LoadingSpinner";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, router, user]);

  if (loading || !user) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-600 shadow-sm">
          <LoadingSpinner />
          Checking access
        </div>
      </section>
    );
  }

  return children;
}
