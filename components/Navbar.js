"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { listenToNotificationsForUser, markNotificationAsRead } from "../lib/firestore";
import { getInitials } from "../lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, signIn, signOut, isFirebaseConfigured } = useAuth();
  const [authLoading, setAuthLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsError, setNotificationsError] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setNotificationsError("");
      return undefined;
    }

    return listenToNotificationsForUser(
      user.uid,
      (nextNotifications) => {
        setNotifications(nextNotifications);
        setNotificationsError("");
      },
      (error) => {
        setNotificationsError(error.message || "Failed to load notifications.");
      },
    );
  }, [user?.uid]);

  const handleSignIn = async () => {
    setAuthLoading(true);

    try {
      await signIn();
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setAuthLoading(true);

    try {
      await signOut();
    } finally {
      setAuthLoading(false);
    }
  };

  const navLinks = mounted && user
    ? [
        { href: "/feed", label: "Feed" },
        { href: "/idea/new", label: "Start thread" },
        { href: "/dashboard", label: "My ideas" },
      ]
    : [];
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const latestNotifications = notifications.slice(0, 6);

  const handleNotificationClick = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    } finally {
      setIsNotificationsOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
            IT
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-slate-950">IdeaThreads</p>
            <p className="text-sm text-slate-500">Live conversations around ideas</p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {!mounted || loading ? (
            <div className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-500">
              Loading...
            </div>
          ) : user ? (
            <>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen((current) => !current)}
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  aria-label="Open notifications"
                >
                  <span className="text-lg leading-none">o</span>
                  {unreadCount ? (
                    <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-500 px-1.5 py-0.5 text-center text-[11px] font-semibold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : null}
                </button>

                {isNotificationsOpen ? (
                  <div className="absolute right-0 top-14 z-40 w-[min(360px,calc(100vw-2rem))] rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-xl">
                    <div className="flex items-center justify-between px-2 pb-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">Notifications</p>
                        <p className="text-xs text-slate-500">
                          {unreadCount ? `${unreadCount} unread` : "All caught up"}
                        </p>
                      </div>
                    </div>

                    {notificationsError ? (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {notificationsError}
                      </div>
                    ) : latestNotifications.length ? (
                      <div className="space-y-2">
                        {latestNotifications.map((notification) => (
                          <Link
                            key={notification.id}
                            href={`/idea/${notification.ideaId}`}
                            onClick={() => handleNotificationClick(notification.id)}
                            className={`block rounded-2xl border px-3 py-3 transition ${
                              notification.read
                                ? "border-slate-200 bg-slate-50 hover:border-slate-300"
                                : "border-emerald-200 bg-emerald-50 hover:border-emerald-300"
                            }`}
                          >
                            <p className="text-sm font-semibold text-slate-950">
                              {notification.senderName} replied to your room
                            </p>
                            <p className="mt-1 text-xs text-slate-500">{notification.ideaTitle}</p>
                            <p className="mt-2 text-sm text-slate-700">
                              {notification.text.length > 88
                                ? `${notification.text.slice(0, 87)}...`
                                : notification.text}
                            </p>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
                        No notifications yet.
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="hidden items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    {getInitials(user.displayName || user.email || "User")}
                  </div>
                )}
                <div className="max-w-[160px]">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {user.displayName || "Participant"}
                  </p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={authLoading}
                className="button-secondary px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {authLoading ? "Working..." : "Logout"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleSignIn}
              disabled={authLoading || !isFirebaseConfigured}
              className="button-primary px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {!isFirebaseConfigured
                ? "Set up Firebase"
                : authLoading
                  ? "Signing in..."
                  : "Sign in"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
