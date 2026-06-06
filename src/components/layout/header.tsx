"use client";

import { Menu, X, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

export function Header({ onMenuToggle, isSidebarOpen }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuToggle}
        className="lg:hidden"
      >
        {isSidebarOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-50">
          <Target className="h-4 w-4 text-white dark:text-zinc-900" />
        </div>
        <span className="text-lg font-bold">LeadFlow</span>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            JD
          </div>
          <div className="hidden text-sm sm:block">
            <p className="font-medium">John Doe</p>
            <p className="text-xs text-zinc-500">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
