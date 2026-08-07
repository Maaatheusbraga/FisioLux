/**
 * Seed inicial FisioLux
 *
 * Cria 1 clínica + 1 administrador (registro em `usuarios`).
 * Para vincular Auth + senha: npm run auth:bootstrap-admin
 */

import "dotenv/config";
import { PrismaClient, perfil_usuario } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const clinicaNome =
    process.env.SEED_CLINICA_NOME?.trim() || "Clinica Demo FisioLux";
  const adminNome =
    process.env.SEED_ADMIN_NOME?.trim() || "Administrador FisioLux";
  const adminEmail =
    process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase() ||
    "admin@fisiolux.local";
  const authUserId = process.env.SEED_ADMIN_AUTH_USER_ID?.trim() || null;

  console.log("→ Seed FisioLux");
  console.log(`  Clínica: ${clinicaNome}`);
  console.log(`  Admin:   ${adminNome} <${adminEmail}>`);

  let clinica = await prisma.clinica.findFirst({
    where: { nome: clinicaNome, deleted_at: null },
  });

  if (!clinica) {
    clinica = await prisma.clinica.findFirst({
      where: { deleted_at: null },
      orderBy: { created_at: "asc" },
    });
  }

  if (!clinica) {
    clinica = await prisma.clinica.create({
      data: {
        nome: clinicaNome,
        ativa: true,
      },
    });
    console.log(`  ✓ Clínica criada: ${clinica.id}`);
  } else {
    console.log(`  · Clínica já existe: ${clinica.id}`);
  }

  const adminExistente = await prisma.usuario.findFirst({
    where: {
      clinica_id: clinica.id,
      email: adminEmail,
      deleted_at: null,
    },
  });

  if (!adminExistente) {
    const admin = await prisma.usuario.create({
      data: {
        clinica_id: clinica.id,
        nome: adminNome,
        email: adminEmail,
        perfil: perfil_usuario.administrador,
        ativo: true,
        auth_user_id: authUserId,
      },
    });
    console.log(`  ✓ Admin criado: ${admin.id}`);
  } else if (authUserId && !adminExistente.auth_user_id) {
    await prisma.usuario.update({
      where: { id: adminExistente.id },
      data: { auth_user_id: authUserId },
    });
    console.log(`  ✓ Admin atualizado com auth_user_id`);
  } else {
    console.log(`  · Admin já existe: ${adminExistente.id}`);
  }

  console.log("→ Seed concluído.");
  console.log("  Dica: rode npm run auth:bootstrap-admin para criar login no Auth.");
}

main()
  .catch((error) => {
    console.error("Seed falhou:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
