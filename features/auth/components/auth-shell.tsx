"use client";

import Image from "next/image";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { GradientBackground } from "@/components/ui/gradient-background";

type Props = {
  title: string;
  children: React.ReactNode;
};

export function AuthShell({ title, children }: Props) {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 md:px-8">
      <GradientBackground className="absolute inset-0" />

      <div className="absolute right-4 top-4 z-20 rounded-lg bg-surface-raised/70 backdrop-blur-sm">
        <ThemeToggle />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col items-center justify-center gap-10 md:flex-row md:items-center md:gap-20">
        <header className="flex shrink-0 justify-center md:w-auto">
          <Image
            src="/logo.png"
            alt="FisioLux"
            width={284}
            height={414}
            priority
            className="h-52 w-auto drop-shadow-sm md:h-72"
          />
        </header>

        <section className="w-full max-w-md space-y-6 rounded-xl border border-border bg-surface-raised/90 p-6 shadow-sm backdrop-blur-md">
          <h1 className="text-lg font-semibold text-ink">{title}</h1>
          {children}
        </section>
      </div>
    </main>
  );
}
