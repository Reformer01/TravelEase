"use client";

import * as React from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CancellationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  bookingReference: string;
  bookingLocation?: string;
  loading?: boolean;
}

export function CancellationModal({ open, onOpenChange, onConfirm, onCancel, bookingReference, bookingLocation = "Your Destination", loading = false }: CancellationModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 p-0">
        <div className="p-8 text-center">
          {/* Warning Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-3xl">warning</span>
          </div>
          
          <AlertDialogTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            Cancel Booking?
          </AlertDialogTitle>
          
          <AlertDialogDescription className="text-slate-600 dark:text-slate-400 text-base leading-relaxed mb-8">
            Are you sure you want to cancel your booking for <span className="font-semibold text-slate-900 dark:text-slate-100">{bookingLocation}</span>? This action cannot be undone and may be subject to a cancellation fee.
          </AlertDialogDescription>
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <AlertDialogAction asChild>
              <Button 
                variant="destructive" 
                onClick={onConfirm} 
                disabled={loading}
                className="w-full py-4 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">event_busy</span>
                {loading ? "Cancelling..." : "Cancel Booking"}
              </Button>
            </AlertDialogAction>
            
            <AlertDialogCancel asChild>
              <Button 
                variant="outline" 
                disabled={loading}
                className="w-full py-4 px-6 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-900 dark:text-white font-bold rounded-xl transition-colors"
              >
                Keep Booking
              </Button>
            </AlertDialogCancel>
          </div>
          
          <p className="mt-6 text-xs text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
            Reference: #{bookingReference}
          </p>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
