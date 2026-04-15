"use client";

import { useState } from "react";

const MAX_MESSAGE_LENGTH = 400;

export default function MessageComposer({
  onSubmit,
  isSubmitting,
  errorMessage,
  placeholder = "Write a reply...",
  buttonLabel = "Reply",
}) {
  const [text, setText] = useState("");
  const [fieldError, setFieldError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = text.trim();

    if (!trimmed) {
      setFieldError("Write a message first.");
      return;
    }

    await onSubmit(trimmed);
    setText("");
    setFieldError("");
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-3">
        <textarea
          value={text}
          onChange={(event) => {
            setText(event.target.value.slice(0, MAX_MESSAGE_LENGTH));
            setFieldError("");
          }}
          rows={4}
          placeholder={placeholder}
          className="input-field min-h-[120px] resize-y rounded-3xl"
        />

        <div className="flex items-center justify-between gap-3">
          <div>
            {fieldError ? <p className="text-sm font-medium text-rose-600">{fieldError}</p> : null}
            {errorMessage ? (
              <p className="text-sm font-medium text-rose-600">{errorMessage}</p>
            ) : null}
          </div>
          <span className="text-xs text-slate-400">
            {text.length}/{MAX_MESSAGE_LENGTH}
          </span>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="button-primary px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Sending..." : buttonLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
