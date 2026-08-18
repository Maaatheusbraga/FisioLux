import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

function slugNome(nome: string) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function carregarImagem(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Falha ao carregar imagem."));
    img.src = src;
  });
}

async function jpegDaImagem(img: HTMLImageElement): Promise<Uint8Array> {
  const max = 1600;
  const scale = Math.min(
    1,
    max / Math.max(img.naturalWidth, img.naturalHeight),
  );
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.9);
  });
  if (!blob) throw new Error("Não foi possível gerar a imagem.");
  return new Uint8Array(await blob.arrayBuffer());
}

function encaixar(
  iw: number,
  ih: number,
  bw: number,
  bh: number,
): { w: number; h: number } {
  const s = Math.min(bw / iw, bh / ih);
  return { w: iw * s, h: ih * s };
}

/**
 * PDF A4 paisagem com as duas fotos inteiras, lado a lado.
 * O slider da tela é só ferramenta de visualização — não entra no arquivo.
 */
export async function baixarComparacaoPdf(opts: {
  antesUrl: string;
  depoisUrl: string;
  pacienteNome: string;
  antesLegenda?: string;
  depoisLegenda?: string;
}) {
  const [antes, depois] = await Promise.all([
    carregarImagem(opts.antesUrl),
    carregarImagem(opts.depoisUrl),
  ]);

  const pdf = await PDFDocument.create();
  const pagina = pdf.addPage([842, 595]);
  const { width, height } = pagina.getSize();
  const fonte = await pdf.embedFont(StandardFonts.Helvetica);
  const fonteBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const margem = 36;
  const topo = 52;
  const rotulo = 18;

  pagina.drawText("FisioLux", {
    x: margem,
    y: height - 28,
    size: 11,
    font: fonteBold,
    color: rgb(0.15, 0.35, 0.32),
  });
  pagina.drawText(opts.pacienteNome, {
    x: margem + 56,
    y: height - 28,
    size: 11,
    font: fonte,
    color: rgb(0.2, 0.2, 0.2),
  });
  pagina.drawText("Antes e depois — fotos completas", {
    x: margem,
    y: height - 44,
    size: 9,
    font: fonte,
    color: rgb(0.4, 0.4, 0.4),
  });

  const colGap = 16;
  const colW = (width - margem * 2 - colGap) / 2;
  const colH = height - margem - topo - rotulo;
  const yBase = margem;

  const jpgAntes = await pdf.embedJpg(await jpegDaImagem(antes));
  const jpgDepois = await pdf.embedJpg(await jpegDaImagem(depois));

  const colunas = [
    {
      img: jpgAntes,
      x: margem,
      titulo: "Antes",
      extra: opts.antesLegenda,
    },
    {
      img: jpgDepois,
      x: margem + colW + colGap,
      titulo: "Depois",
      extra: opts.depoisLegenda,
    },
  ];

  for (const col of colunas) {
    pagina.drawText(
      col.extra ? `${col.titulo}  ·  ${col.extra}` : col.titulo,
      {
        x: col.x,
        y: yBase + colH + 4,
        size: 10,
        font: fonteBold,
        color: rgb(0.15, 0.15, 0.15),
      },
    );

    const box = encaixar(col.img.width, col.img.height, colW, colH);
    const x = col.x + (colW - box.w) / 2;
    const y = yBase + (colH - box.h) / 2;
    pagina.drawRectangle({
      x: col.x,
      y: yBase,
      width: colW,
      height: colH,
      color: rgb(0.96, 0.96, 0.96),
    });
    pagina.drawImage(col.img, {
      x,
      y,
      width: box.w,
      height: box.h,
    });
  }

  const bytes = await pdf.save();
  const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
  const slug = slugNome(opts.pacienteNome);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `FISIOLUX-${slug || "paciente"}-antes-depois.pdf`;
  a.click();
  URL.revokeObjectURL(a.href);
}
