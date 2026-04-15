import Link from "next/link";

export default function EmptyState({ title, description, actionHref, actionLabel }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-slate-600">{description}</p>
      {actionHref && actionLabel ? (
        <div className="mt-6">
          <Link href={actionHref} className="button-primary">
            {actionLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
