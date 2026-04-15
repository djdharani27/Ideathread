"use client";

import { useMemo, useState } from "react";
import { IDEA_LIMITS } from "../lib/utils";

const initialValues = {
  title: "",
  description: "",
};

export default function IdeaForm({ onSubmit, isSubmitting, errorMessage }) {
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});

  const counters = useMemo(
    () => ({
      title: values.title.length,
      description: values.description.length,
    }),
    [values],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    const maxLength = IDEA_LIMITS[name];
    const nextValue = maxLength ? value.slice(0, maxLength) : value;

    setValues((current) => ({
      ...current,
      [name]: nextValue,
    }));
    setFieldErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const validate = () => {
    const nextErrors = {};

    Object.entries(IDEA_LIMITS).forEach(([field, maxLength]) => {
      const value = values[field].trim();

      if (!value) {
        nextErrors[field] = "This field is required.";
      } else if (value.length > maxLength) {
        nextErrors[field] = `Must be ${maxLength} characters or fewer.`;
      }
    });

    setFieldErrors(nextErrors);
    return !Object.keys(nextErrors).length;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit(
      Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()])),
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <Field
        label="Title"
        name="title"
        value={values.title}
        onChange={handleChange}
        maxLength={IDEA_LIMITS.title}
        count={counters.title}
        error={fieldErrors.title}
        placeholder="What is the idea?"
      />

      <Field
        label="Description"
        name="description"
        value={values.description}
        onChange={handleChange}
        maxLength={IDEA_LIMITS.description}
        count={counters.description}
        error={fieldErrors.description}
        placeholder="What are you thinking about, building, or questioning?"
        multiline
      />

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Starting room..." : "Start conversation"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  maxLength,
  count,
  error,
  placeholder,
  multiline = false,
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={name} className="text-sm font-medium text-slate-700">
          {label}
        </label>
        <span className="text-xs text-slate-400">
          {count}/{maxLength}
        </span>
      </div>
      {multiline ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          rows={6}
          placeholder={placeholder}
          className="input-field min-h-[168px] resize-y"
        />
      ) : (
        <input
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="input-field"
        />
      )}
      {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}
