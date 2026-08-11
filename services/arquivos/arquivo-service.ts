import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors/app-error";
import {
  assertPermissao,
  possuiPermissao,
} from "@/lib/auth/permissoes";
import type { SessaoUsuario } from "@/lib/auth/sessao";
import { ArquivoRepository } from "@/repositories/arquivos/arquivo-repository";
import { PacienteRepository } from "@/repositories/pacientes/paciente-repository";
import { SessaoRepository } from "@/repositories/sessoes/sessao-repository";
import { TimelineService } from "@/services/timeline/timeline-service";
import { getStorageService } from "@/lib/storage";
import type { StorageService } from "@/services/storage/storage-service";
import type { UploadArquivoMetaInput } from "@/lib/validations/arquivo";
import {
  CATEGORIAS_DOCUMENTOS,
  CATEGORIAS_MIDIA,
  CATEGORIAS_MIDIA_UPLOAD,
  LIMITE_UPLOAD_PADRAO,
  LIMITE_UPLOAD_VIDEO,
  URL_ASSINADA_SEGUNDOS,
  ehCategoriaDocumento,
  ehCategoriaMidia,
  labelCategoriaArquivo,
  type EscopoArquivo,
} from "@/config/arquivos";
import type { categoria_arquivo } from "@prisma/client";

export type ArquivoUploadFile = {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
  size: number;
};

function serializarArquivo<T extends { tamanho: bigint }>(item: T) {
  return {
    ...item,
    tamanho: Number(item.tamanho),
  };
}

export class ArquivoService {
  constructor(
    private readonly arquivos = new ArquivoRepository(),
    private readonly pacientes = new PacienteRepository(),
    private readonly sessoes = new SessaoRepository(),
    private readonly timeline = new TimelineService(),
    private readonly storage: StorageService = getStorageService(),
  ) {}

  private assertAcessoDocumentos(sessao: SessaoUsuario) {
    if (
      !possuiPermissao(sessao.perfil, "arquivos.cadastrais") &&
      !possuiPermissao(sessao.perfil, "arquivos.clinicos")
    ) {
      throw new AppError("Permissão negada: arquivos", "FORBIDDEN");
    }
  }

  private assertAcessoMidia(sessao: SessaoUsuario) {
    assertPermissao(sessao.perfil, "arquivos.clinicos");
  }

  private assertCategoria(
    sessao: SessaoUsuario,
    categoria: categoria_arquivo,
  ) {
    if (ehCategoriaDocumento(categoria)) {
      this.assertAcessoDocumentos(sessao);
      return;
    }
    if (ehCategoriaMidia(categoria)) {
      this.assertAcessoMidia(sessao);
      return;
    }
    throw new AppError("Categoria inválida.", "CATEGORIA_INVALIDA");
  }

  /** Categorias para o formulário de upload conforme o contexto de tela. */
  categoriasDisponiveisParaUpload(
    sessao: SessaoUsuario,
    escopo: EscopoArquivo = "documentos",
  ) {
    if (escopo === "documentos") {
      this.assertAcessoDocumentos(sessao);
      return CATEGORIAS_DOCUMENTOS.map((c) => ({
        value: c,
        label: labelCategoriaArquivo(c),
      }));
    }

    this.assertAcessoMidia(sessao);
    return CATEGORIAS_MIDIA_UPLOAD.map((c) => ({
      value: c,
      label: c === "video" ? "Vídeo" : "Foto",
    }));
  }

  async listar(
    sessao: SessaoUsuario,
    opts: {
      pacienteId?: string;
      sessaoId?: string;
      categoria?: categoria_arquivo | "todos";
      escopo?: EscopoArquivo | "todos";
      page?: number;
      pageSize?: number;
    },
  ) {
    const escopo = opts.escopo ?? "todos";

    if (escopo === "documentos") {
      this.assertAcessoDocumentos(sessao);
    } else if (escopo === "midia") {
      this.assertAcessoMidia(sessao);
    } else {
      this.assertAcessoDocumentos(sessao);
    }

    let categorias: categoria_arquivo[];
    if (escopo === "documentos") {
      categorias = [...CATEGORIAS_DOCUMENTOS];
    } else if (escopo === "midia") {
      categorias = [...CATEGORIAS_MIDIA];
    } else if (possuiPermissao(sessao.perfil, "arquivos.clinicos")) {
      categorias = [...CATEGORIAS_DOCUMENTOS, ...CATEGORIAS_MIDIA];
    } else {
      categorias = [...CATEGORIAS_DOCUMENTOS];
    }

    if (opts.categoria && opts.categoria !== "todos") {
      if (!categorias.includes(opts.categoria)) {
        throw new AppError("Categoria não permitida.", "FORBIDDEN");
      }
      categorias = [opts.categoria];
    }

    const resultado = await this.arquivos.listar({
      clinicaId: sessao.clinicaId,
      pacienteId: opts.pacienteId,
      sessaoId: opts.sessaoId,
      categorias,
      page: opts.page,
      pageSize: opts.pageSize,
    });

    return {
      ...resultado,
      items: resultado.items.map(serializarArquivo),
    };
  }

  async obter(sessao: SessaoUsuario, id: string) {
    const found = await this.arquivos.buscarPorId(sessao.clinicaId, id);
    if (!found) {
      throw new AppError("Arquivo não encontrado.", "ARQUIVO_NOT_FOUND");
    }
    this.assertCategoria(sessao, found.categoria);
    return serializarArquivo(found);
  }

  async obterUrlAssinada(sessao: SessaoUsuario, id: string) {
    const arquivo = await this.obter(sessao, id);
    const url = await this.storage.getSignedUrl(
      arquivo.storage_key,
      URL_ASSINADA_SEGUNDOS,
    );
    return { url, expiresIn: URL_ASSINADA_SEGUNDOS, arquivo };
  }

  async upload(
    sessao: SessaoUsuario,
    meta: UploadArquivoMetaInput,
    file: ArquivoUploadFile,
  ) {
    this.assertCategoria(sessao, meta.categoria);

    if (ehCategoriaMidia(meta.categoria)) {
      const permitidas = CATEGORIAS_MIDIA_UPLOAD as readonly string[];
      if (
        !permitidas.includes(meta.categoria) &&
        meta.categoria !== "foto_antes" &&
        meta.categoria !== "foto_depois"
      ) {
        throw new AppError("Categoria de mídia inválida.", "CATEGORIA_INVALIDA");
      }
    }

    if (!file.size || file.size <= 0) {
      throw new AppError("Arquivo vazio.", "ARQUIVO_VAZIO");
    }

    const limite =
      meta.categoria === "video" ? LIMITE_UPLOAD_VIDEO : LIMITE_UPLOAD_PADRAO;
    if (file.size > limite) {
      throw new AppError(
        `Arquivo excede o limite de ${Math.round(limite / (1024 * 1024))} MB.`,
        "ARQUIVO_GRANDE",
      );
    }

    const paciente = await this.pacientes.buscarPorId(
      sessao.clinicaId,
      meta.paciente_id,
    );
    if (!paciente) {
      throw new AppError("Paciente não encontrado.", "PACIENTE_NOT_FOUND");
    }

    if (meta.sessao_id) {
      const sessaoClinica = await this.sessoes.buscarPorId(
        sessao.clinicaId,
        meta.sessao_id,
      );
      if (!sessaoClinica || sessaoClinica.paciente_id !== meta.paciente_id) {
        throw new AppError(
          "Sessão inválida para este paciente.",
          "SESSAO_INVALIDA",
        );
      }
    }

    const stored = await this.storage.upload({
      clinicaId: sessao.clinicaId,
      pacienteId: meta.paciente_id,
      categoria: meta.categoria,
      fileName: file.fileName,
      mimeType: file.mimeType || "application/octet-stream",
      body: file.buffer,
      sessaoId: meta.sessao_id,
    });

    try {
      return await prisma.$transaction(async (tx) => {
        const arquivo = await this.arquivos.criar(tx, {
          clinica_id: sessao.clinicaId,
          paciente_id: meta.paciente_id,
          sessao_id: meta.sessao_id,
          usuario_id: sessao.usuarioId,
          provider: stored.provider,
          bucket: stored.bucket,
          storage_key: stored.storageKey,
          mime_type: stored.mimeType,
          tamanho: BigInt(stored.tamanho),
          categoria: meta.categoria,
          descricao: meta.descricao,
          nome_original: file.fileName.slice(0, 255),
        });

        const tipoTimeline = ehCategoriaDocumento(meta.categoria)
          ? "documento_anexado"
          : "arquivo_adicionado";

        await this.timeline.registrar(tx, {
          clinicaId: sessao.clinicaId,
          pacienteId: meta.paciente_id,
          usuarioId: sessao.usuarioId,
          tipo: tipoTimeline,
          descricao: `${labelCategoriaArquivo(meta.categoria)}: ${
            file.fileName
          }${meta.descricao ? ` — ${meta.descricao}` : ""}`,
          arquivoId: arquivo.id,
          sessaoId: meta.sessao_id,
        });

        return serializarArquivo(arquivo);
      });
    } catch (error) {
      try {
        await this.storage.deletePermanent(stored.storageKey);
      } catch {
        // best-effort cleanup
      }
      throw error;
    }
  }

  async excluir(sessao: SessaoUsuario, id: string) {
    const atual = await this.arquivos.buscarPorId(sessao.clinicaId, id);
    if (!atual) {
      throw new AppError("Arquivo não encontrado.", "ARQUIVO_NOT_FOUND");
    }
    this.assertCategoria(sessao, atual.categoria);

    if (!atual.paciente_id) {
      throw new AppError(
        "Arquivo sem paciente vinculado.",
        "ARQUIVO_SEM_PACIENTE",
      );
    }

    const moved = await this.storage.moveToTrash(atual.storage_key);

    await prisma.$transaction(async (tx) => {
      await this.arquivos.softDelete(
        tx,
        sessao.clinicaId,
        id,
        moved.storageKey,
      );

      await this.timeline.registrar(tx, {
        clinicaId: sessao.clinicaId,
        pacienteId: atual.paciente_id!,
        usuarioId: sessao.usuarioId,
        tipo: "arquivo_excluido",
        descricao: `Arquivo excluído: ${
          atual.nome_original || labelCategoriaArquivo(atual.categoria)
        }`,
        arquivoId: id,
        sessaoId: atual.sessao_id ?? undefined,
      });
    });
  }
}
