import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";

type Props = {
  title: string;
  description: string;
  fase: number;
};

export function ModuloEmBreve({ title, description, fase }: Props) {
  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={<Badge>Fase {fase}</Badge>}
      />
      <div className="rounded-xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
        <p className="text-sm font-medium text-ink">Módulo em construção</p>
      </div>
    </div>
  );
}
