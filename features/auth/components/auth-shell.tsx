import { appConfig } from "@/config/app";
import { ThemeToggle } from "@/components/layout/theme-toggle";

type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function AuthShell({ title, description, children }: Props) {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-fg">
            Fx
          </div>
          <p className="text-2xl font-semibold tracking-tight text-ink">
            {appConfig.name}
          </p>
          <h1 className="text-base text-ink-muted">{title}</h1>
          {description ? (
            <p className="text-sm text-ink-subtle">{description}</p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-border bg-surface-raised p-6 shadow-sm">
          {children}
        </div>
      </div>
    </main>
  );
}
