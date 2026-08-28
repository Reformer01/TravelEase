import Link from "next/link";
import { Button } from "./button";

export function EmptyState({ icon, title, description, actionHref, actionLabel, onAction }: { icon?: string; title: string; description: string; actionHref?: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
      {icon && <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">{icon}</span>}
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-slate-500 mb-8">{description}</p>
      {actionHref && actionLabel && <Link href={actionHref}><Button>{actionLabel}</Button></Link>}
      {onAction && actionLabel && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}
