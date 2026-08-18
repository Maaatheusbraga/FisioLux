type Ponto = { dia: string; total: number };

type Props = {
  emTratamento: number;
  altas: number;
  atendimentos30d: number;
  serie: Ponto[];
};

function sparkPath(serie: Ponto[], width: number, height: number) {
  const max = Math.max(1, ...serie.map((p) => p.total));
  const step = serie.length > 1 ? width / (serie.length - 1) : width;
  return serie
    .map((p, i) => {
      const x = i * step;
      const y = height - (p.total / max) * (height - 4) - 2;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function areaPath(serie: Ponto[], width: number, height: number) {
  const line = sparkPath(serie, width, height);
  return `${line} L ${width} ${height} L 0 ${height} Z`;
}

export function ResumoClinica({
  emTratamento,
  altas,
  atendimentos30d,
  serie,
}: Props) {
  const w = 640;
  const h = 96;
  const d = sparkPath(serie, w, h);
  const area = areaPath(serie, w, h);

  const linhas = [
    { label: "Em tratamento", valor: String(emTratamento) },
    { label: "Altas", valor: String(altas) },
    { label: "Atendimentos (30 dias)", valor: String(atendimentos30d) },
  ];

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface-raised">
      <div className="px-5 pt-5">
        <h2 className="text-sm font-semibold text-ink">Movimento da clínica</h2>
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="mt-3 h-24 w-full text-primary"
        role="img"
        aria-label="Atendimentos por dia nos últimos 30 dias"
      >
        <path d={area} fill="currentColor" className="opacity-15" />
        <path
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <ul className="divide-y divide-border border-t border-border">
        {linhas.map((l) => (
          <li
            key={l.label}
            className="flex items-baseline justify-between gap-4 px-5 py-3"
          >
            <p className="text-sm text-ink">{l.label}</p>
            <p className="text-lg font-semibold tabular-nums text-ink">
              {l.valor}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
