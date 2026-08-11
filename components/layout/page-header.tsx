import { cn } from "@/utils/cn";
import { HelpTip } from "@/components/ui/help-tip";

type Props = {
  title: string;
  /** Texto curto sob o título — preferir `help` para explicações longas. */
  description?: string;
  /** Ajuda sob o “?” ao lado do título (hover/clique). */
  help?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  help,
  actions,
  children,
  className,
}: Props) {
  return (
    <div className={cn("mb-8 space-y-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-ink">
              {title}
            </h1>
            {help ? (
              <HelpTip label={`Sobre: ${title}`} className="translate-y-0.5">
                {help}
              </HelpTip>
            ) : null}
          </div>
          {description ? (
            <p className="max-w-2xl text-sm text-ink-muted">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {children}
    </div>
  );
}
