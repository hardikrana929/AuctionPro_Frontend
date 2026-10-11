export function LoadingState({ label = "Loading data..." }) {
  return (
    <div className="flex min-h-40 items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      {label}
    </div>
  );
}

export function EmptyState({ title, description }) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center px-4 text-center">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}
