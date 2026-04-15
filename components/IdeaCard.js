import Link from "next/link";
import { getInitials, getTimestampLabel, truncate } from "../lib/utils";

export default function IdeaCard({ idea, replyCount, isOwnIdea }) {
  return (
    <Link
      href={`/idea/${idea.id}`}
      className="block border-b border-slate-200 bg-white px-4 py-4 transition hover:bg-slate-50 sm:px-5"
    >
      <div className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
          {getInitials(idea.authorName || "User")}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="font-semibold text-slate-950">{idea.authorName}</span>
            <span className="text-slate-400">@participant</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">{getTimestampLabel(idea.createdAt)}</span>
            {isOwnIdea ? (
              <>
                <span className="text-slate-300">·</span>
                <span className="font-medium text-emerald-700">your room</span>
              </>
            ) : null}
          </div>

          <h2 className="mt-1 text-[17px] font-semibold leading-7 text-slate-950">{idea.title}</h2>
          <p className="mt-1 text-[15px] leading-7 text-slate-700">
            {truncate(idea.description || idea.problem, 220)}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span>{replyCount} replies</span>
            {replyCount > 0 ? (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                Active
              </span>
            ) : null}
            <span>Open room</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
