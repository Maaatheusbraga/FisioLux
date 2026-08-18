import { cn } from "@/utils/cn";

type Props = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  actions,
  children,
  className,
}: Props) {
  return (
    <div className={cn("mb-8 space-y-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-ink">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm text-ink-muted">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
}
