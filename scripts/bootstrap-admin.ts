/**
 * Cria (ou reutiliza) usuário no Supabase Auth e vincula ao registro `usuarios`.
 *
 * Uso:
 *   npm run auth:bootstrap-admin
 *
 * Variáveis: SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ADMIN_NOME (opcional)
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient, perfil_usuario } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL || "admin@fisiolux.local")
    .trim()
    .toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD?.trim();
  const nome =
    process.env.SEED_ADMIN_NOME?.trim() || "Administrador FisioLux";

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios.");
  }
  if (!password || password.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD deve ter pelo menos 8 caracteres.");
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("→ Bootstrap admin Auth");
  console.log(`  E-mail: ${email}`);

  let authUserId: string | null = null;

  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nome },
  });

  if (created.error) {
    // Já existe — tenta localizar via listUsers
    const listed = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (listed.error) {
      throw listed.error;
    }
    const found = listed.data.users.find(
      (u) => u.email?.toLowerCase() === email,
    );
    if (!found) {
      throw created.error;
    }
    authUserId = found.id;
    console.log(`  · Usuário Auth já existia: ${authUserId}`);
  } else {
    authUserId = created.data.user.id;
    console.log(`  ✓ Usuário Auth criado: ${authUserId}`);
  }

  let clinica = await prisma.clinica.findFirst({
    where: { deleted_at: null },
    orderBy: { created_at: "asc" },
  });

  if (!clinica) {
    clinica = await prisma.clinica.create({
      data: {
        nome: process.env.SEED_CLINICA_NOME?.trim() || "Clinica Demo FisioLux",
        ativa: true,
      },
    });
    console.log(`  ✓ Clínica criada: ${clinica.id}`);
  }

  let usuario = await prisma.usuario.findFirst({
    where: {
      clinica_id: clinica.id,
      email,
      deleted_at: null,
    },
  });

  if (!usuario) {
    usuario = await prisma.usuario.create({
      data: {
        clinica_id: clinica.id,
        email,
        nome,
        perfil: perfil_usuario.administrador,
        ativo: true,
        auth_user_id: authUserId,
      },
    });
    console.log(`  ✓ Registro usuarios criado: ${usuario.id}`);
  } else {
    usuario = await prisma.usuario.update({
      where: { id: usuario.id },
      data: { auth_user_id: authUserId, ativo: true },
    });
    console.log(`  ✓ Registro usuarios vinculado: ${usuario.id}`);
  }

  console.log("→ Bootstrap concluído. Você já pode fazer login.");
}

main()
  .catch((error) => {
    console.error("Bootstrap falhou:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
