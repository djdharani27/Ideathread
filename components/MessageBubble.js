import Image from "next/image";
import { getInitials, getTimestampLabel } from "../lib/utils";

export default function MessageBubble({ message, isOwnMessage = false }) {
  return (
    <article className="border-b border-slate-200 bg-white px-4 py-4 sm:px-5">
      <div className="flex gap-3">
        <div className="shrink-0">
          {message.userPhotoURL ? (
            <Image
              src={message.userPhotoURL}
              alt={message.userName}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
              {getInitials(message.userName)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="font-semibold text-slate-950">{message.userName}</span>
            {isOwnMessage ? <span className="text-emerald-700">you</span> : null}
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">{getTimestampLabel(message.createdAt)}</span>
          </div>

          <p className="mt-2 whitespace-pre-line text-[15px] leading-7 text-slate-700">
            {message.text}
          </p>
        </div>
      </div>
    </article>
  );
}
