import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatarCpf, formatarTelefone } from "@/utils/cpf";
import { calcularIdade, formatarDataBr, formatarDataHoraBr } from "@/utils/date";

type UsuarioNome = { nome: string };

export type PdfProntuarioInput = {
  clinicaNome: string;
  paciente: {
    nome: string;
    cpf: string;
    data_nascimento: Date;
    status: string;
    diagnostico: string | null;
    telefone: string | null;
    medicamentos: string | null;
    alergias: string | null;
  };
  avaliacoes: {
    tipo: string;
    data_avaliacao: Date;
    queixa_principal: string | null;
    exame_fisico: string | null;
    diagnostico_fisioterapeutico: string | null;
    objetivos: string | null;
    observacoes: string | null;
    dados_complementares: unknown;
    usuario: UsuarioNome;
  }[];
  planos: {
    data_plano: Date;
    objetivos: string | null;
    condutas: string | null;
    frequencia_sugerida: string | null;
    previsao_sessoes: number | null;
    observacoes: string | null;
    usuario: UsuarioNome;
  }[];
  evolucoes: {
    data_evolucao: Date;
    descricao: string;
    escala_dor: number | null;
    observacoes: string | null;
    usuario: UsuarioNome;
  }[];
  altas: {
    data_alta: Date;
    motivo: string | null;
    observacoes: string | null;
    data_reabertura: Date | null;
    usuario: UsuarioNome;
  }[];
  sessoes: {
    realizado_em: Date;
    procedimentos: string | null;
    escala_dor: number | null;
    profissional: UsuarioNome;
  }[];
};

function dadosComplementaresResumo(dados: unknown): string[] {
  if (!dados || typeof dados !== "object") return [];
  const d = dados as Record<string, unknown>;
  const out: string[] = [];
  const push = (label: string, v: unknown) => {
    if (v == null || v === "" || v === false) return;
    if (Array.isArray(v) && v.length === 0) return;
    if (typeof v === "object" && !Array.isArray(v)) {
      const nested = Object.entries(v as Record<string, unknown>)
        .filter(([, x]) => x != null && x !== "" && x !== false)
        .map(
          ([k, x]) => `${k}: ${Array.isArray(x) ? x.join(", ") : String(x)}`,
        )
        .join("; ");
      if (nested) out.push(`${label}: ${nested}`);
      return;
    }
    out.push(`${label}: ${Array.isArray(v) ? v.join(", ") : String(v)}`);
  };

  push("Cronologia", d.cronologia);
  push("HDA", d.hda);
  push("Dor", d.dor);
  push("Histórico clínico", d.historico_clinico);
  push("Contexto", d.contexto);
  push("Exame", d.exame);
  push("Hipótese", d.hipotese_diagnostica ?? d.hipotese);
  push("Contraindicações", d.contraindicacoes);
  push("Ultrassom", d.ultrassonografia ?? d.ultrassom);
  return out;
}

export async function gerarPdfProntuarioPaciente(
  input: PdfProntuarioInput,
): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const maxWidth = pageWidth - margin * 2;
  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const ensureSpace = (needed: number) => {
    if (y - needed < margin) {
      page = pdf.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
  };

  const drawText = (
    text: string,
    opts: {
      size?: number;
      bold?: boolean;
      color?: ReturnType<typeof rgb>;
      gap?: number;
    } = {},
  ) => {
    const size = opts.size ?? 10;
    const usedFont = opts.bold ? fontBold : font;
    const color = opts.color ?? rgb(0.13, 0.13, 0.13);
    const lines = wrapText(text, usedFont, size, maxWidth);
    for (const line of lines) {
      ensureSpace(size + 4);
      page.drawText(line, {
        x: margin,
        y: y - size,
        size,
        font: usedFont,
        color,
        maxWidth,
      });
      y -= size + 3;
    }
    if (opts.gap) y -= opts.gap;
  };

  const secao = (titulo: string, linhas: (string | null | undefined)[]) => {
    const uteis = linhas.filter((l) => l && String(l).trim().length > 0);
    if (uteis.length === 0) return;
    y -= 8;
    drawText(titulo, { size: 12, bold: true, color: rgb(0.07, 0.07, 0.07) });
    for (const linha of uteis) {
      drawText(String(linha), { size: 10 });
    }
  };

  const { paciente } = input;

  drawText("FisioLux", {
    size: 18,
    bold: true,
    color: rgb(0.06, 0.46, 0.43),
  });
  drawText(input.clinicaNome, { size: 11, color: rgb(0.3, 0.3, 0.3) });
  drawText(`Relatório clínico · ${formatarDataHoraBr(new Date())}`, {
    size: 10,
    color: rgb(0.35, 0.35, 0.35),
    gap: 8,
  });

  drawText(paciente.nome, { size: 14, bold: true });
  drawText(
    [
      `CPF: ${formatarCpf(paciente.cpf)}`,
      `Nascimento: ${formatarDataBr(paciente.data_nascimento)} (${calcularIdade(paciente.data_nascimento)} anos)`,
      `Status: ${paciente.status === "alta" ? "Alta" : "Em tratamento"}`,
      paciente.diagnostico ? `Diagnóstico: ${paciente.diagnostico}` : null,
      paciente.telefone
        ? `Telefone: ${formatarTelefone(paciente.telefone)}`
        : null,
      paciente.medicamentos ? `Medicamentos: ${paciente.medicamentos}` : null,
      paciente.alergias ? `Alergias: ${paciente.alergias}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  for (const a of input.avaliacoes) {
    secao(`Avaliação (${a.tipo}) — ${formatarDataBr(a.data_avaliacao)}`, [
      `Profissional: ${a.usuario.nome}`,
      a.queixa_principal ? `Queixa: ${a.queixa_principal}` : null,
      a.exame_fisico ? `Exame físico: ${a.exame_fisico}` : null,
      a.diagnostico_fisioterapeutico
        ? `Diagnóstico fisioterapêutico: ${a.diagnostico_fisioterapeutico}`
        : null,
      a.objetivos ? `Objetivos: ${a.objetivos}` : null,
      a.observacoes ? `Observações: ${a.observacoes}` : null,
      ...dadosComplementaresResumo(a.dados_complementares),
    ]);
  }

  for (const p of input.planos) {
    secao(`Plano terapêutico — ${formatarDataBr(p.data_plano)}`, [
      `Profissional: ${p.usuario.nome}`,
      p.objetivos ? `Objetivos: ${p.objetivos}` : null,
      p.condutas ? `Condutas: ${p.condutas}` : null,
      p.frequencia_sugerida ? `Frequência: ${p.frequencia_sugerida}` : null,
      p.previsao_sessoes != null
        ? `Previsão de sessões: ${p.previsao_sessoes}`
        : null,
      p.observacoes ? `Observações: ${p.observacoes}` : null,
    ]);
  }

  for (const e of input.evolucoes) {
    secao(`Evolução — ${formatarDataBr(e.data_evolucao)}`, [
      `Profissional: ${e.usuario.nome}`,
      `Descrição: ${e.descricao}`,
      e.escala_dor != null ? `Dor: ${e.escala_dor}/10` : null,
      e.observacoes ? `Observações: ${e.observacoes}` : null,
    ]);
  }

  if (input.sessoes.length > 0) {
    secao(
      "Atendimentos recentes",
      input.sessoes.slice(0, 25).map((s) => {
        const dor = s.escala_dor != null ? ` · dor ${s.escala_dor}/10` : "";
        const proc = s.procedimentos ? ` — ${s.procedimentos}` : "";
        return `${formatarDataHoraBr(s.realizado_em)} · ${s.profissional.nome}${dor}${proc}`;
      }),
    );
  }

  for (const a of input.altas) {
    secao(`Alta — ${formatarDataBr(a.data_alta)}`, [
      `Profissional: ${a.usuario.nome}`,
      a.motivo ? `Motivo: ${a.motivo}` : null,
      a.observacoes ? `Observações: ${a.observacoes}` : null,
      a.data_reabertura
        ? `Reaberto em: ${formatarDataBr(a.data_reabertura)}`
        : null,
    ]);
  }

  y -= 16;
  drawText(
    "Documento gerado pelo FisioLux. Confidencial — uso restrito à clínica e ao paciente.",
    { size: 8, color: rgb(0.45, 0.45, 0.45) },
  );

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}

function wrapText(
  text: string,
  font: { widthOfTextAtSize: (t: string, s: number) => number },
  size: number,
  maxWidth: number,
): string[] {
  const paragraphs = text.split(/\n/);
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }
    const words = paragraph.split(/\s+/);
    let current = "";
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) <= maxWidth) {
        current = next;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }

  return lines.length > 0 ? lines : [""];
}
