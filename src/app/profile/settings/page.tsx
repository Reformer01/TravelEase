"use client";

import Link from 'next/link';

export default function ProfileSettingsPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-black tracking-tight">Settings</h1>
          <Link className="text-sm font-bold text-primary hover:underline" href="/profile">
            Back to Profile
          </Link>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Settings page coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
