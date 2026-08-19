# Agenda Google Calendar — produção (passo a passo completo)

Guia para colocar a integração da Agenda funcionando na VPS com a conta Google **da clínica (cliente)**.

Tempo estimado: 1–2 h (inclui Google Cloud + deploy + testes).

---

## Visão geral

| Quem faz | O quê |
| --- | --- |
| **Você (host/dev)** | Deploy na VPS, `.env` mínimo, HTTPS, migrations |
| **Cliente (admin da clínica)** | Google Cloud (ou você faz uma vez), credenciais OAuth na tela Configurações, conectar conta Google |
| **Equipe da clínica** | Usar menu **Agenda** — criar eventos, vincular pacientes |

A conta Google conectada é **sempre a da clínica**, não a sua conta pessoal de desenvolvimento.

---

## Parte A — Pré-requisitos

- [ ] FisioLux já no ar na VPS (login funcionando)
- [ ] **HTTPS** ativo (domínio ou IP com certificado) — **obrigatório** para webhook automático
- [ ] Acesso admin ao FisioLux (`administrador`)
- [ ] Conta Google que a clínica usará no Calendar (ex.: `agenda@clinica.com.br` ou Gmail da recepção)

Anote a URL pública final, por exemplo:

```text
https://fisio.clinicadocliente.com.br
```

Essa URL será o `APP_URL` em produção.

---

## Parte B — Google Cloud Console (conta da clínica ou projeto que você cria para ela)

### B1. Criar / escolher projeto

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto (ex.: `FisioLux Clínica XYZ`) ou use um existente

### B2. Ativar Google Calendar API

1. **APIs e serviços** → **Biblioteca**
2. Busque **Google Calendar API**
3. Clique **Ativar**

### B3. Tela de consentimento OAuth

1. **Google Auth Platform** (ou **Tela de consentimento OAuth**)
2. Tipo: **Externo**
3. Preencha nome do app (ex.: `FisioLux`), e-mails de suporte/desenvolvedor
4. Em **Usuários de teste**, adicione **todos os e-mails Google** que vão autorizar a conexão (conta da agenda + quem for testar)
5. Salve

> Enquanto o app estiver em **modo teste**, só usuários de teste conseguem conectar. Para uso amplo sem aviso “app não verificado”, será preciso publicar/verificar o app no Google (fase futura).

### B4. Credencial OAuth (Aplicativo da Web)

1. **APIs e serviços** → **Credenciais** → **Criar credenciais** → **ID do cliente OAuth**
2. Tipo: **Aplicativo da Web**
3. Nome: ex. `FisioLux Produção`
4. **URIs de redirecionamento autorizados** — adicione **exatamente**:

```text
https://SEU-DOMINIO/api/google-calendar/callback
```

Substitua `SEU-DOMINIO` pela URL real (sem barra no final).

Exemplo:

```text
https://fisio.clinicadocliente.com.br/api/google-calendar/callback
```

5. **Criar** e copie:
   - **ID do cliente** (Client ID)
   - **Chave secreta do cliente** (Client Secret)

Guarde em local seguro — a secret só aparece uma vez na criação.

### B5. URL embed do calendário (visualização na Agenda)

Na conta Google que será conectada:

1. Abra [Google Calendar](https://calendar.google.com/)
2. Configurações do calendário desejado → **Integrar agenda**
3. Copie a **URL de incorporação** (`https://calendar.google.com/calendar/embed?...`) ou o iframe completo

---

## Parte C — Deploy / atualização na VPS

No servidor (SSH), na pasta do projeto:

```bash
cd /caminho/do/FisioLux
git pull
docker compose build
docker compose up -d
docker compose logs -f app
```

O entrypoint roda `prisma migrate deploy` automaticamente (inclui tabelas/campos da agenda).

Health check:

```bash
curl -s https://SEU-DOMINIO/api/health
```

---

## Parte D — `.env` na VPS (só o host preenche)

Edite o `.env` **na VPS** (nunca commitar):

```bash
nano .env
```

### D1. URL pública (obrigatório)

```env
APP_URL=https://fisio.clinicadocliente.com.br
```

Sem barra no final. Deve ser **HTTPS** em produção.

### D2. Chave de criptografia (obrigatório)

```env
AGENDA_TOKEN_SECRET=uma-string-aleatoria-com-pelo-menos-32-caracteres
```

Gere uma vez, por exemplo:

```bash
openssl rand -base64 32
```

**Não** coloque isso na interface do FisioLux — fica só no servidor.

### D3. OAuth Google (opcional no `.env`)

Se o cliente preencher tudo em **Configurações**, **não** precisa no `.env`:

```env
# GOOGLE_CALENDAR_CLIENT_ID=
# GOOGLE_CALENDAR_CLIENT_SECRET=
# GOOGLE_CALENDAR_REDIRECT_URI=
```

Se quiser fallback via servidor, pode preencher — a UI da clínica tem prioridade quando salva credenciais.

### D4. Reiniciar após mudar `.env`

```bash
docker compose up -d --build
```

---

## Parte E — Supabase Auth (se usar domínio novo)

Se mudou de IP para domínio HTTPS:

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. **Site URL**: `https://SEU-DOMINIO`
3. **Redirect URLs**: inclua `https://SEU-DOMINIO/**` e `/callback`

---

## Parte F — Configuração dentro do FisioLux (admin da clínica)

1. Login como **administrador**
2. Menu **Configurações**
3. Bloco **Integração Google Calendar**

Preencher:

| Campo | Valor |
| --- | --- |
| **Client ID OAuth** | ID copiado do Google Cloud (B4) |
| **Chave secreta OAuth** | Secret copiada do Google Cloud (B4) |
| **URI de redirecionamento** | Somente leitura — confira se bate com a cadastrada no Google |
| **ID do calendário** | `primary` (padrão) ou e-mail de calendário secundário |
| **URL embed** | URL/iframe do passo B5 |

4. Clique **Salvar integração**
5. Clique **Conectar conta Google**
6. Use a **conta Google da clínica** (a mesma do calendário)
7. Se aparecer “app não verificado”: **Avançado** → **Continuar** (normal em modo teste)
8. Autorize acesso ao **Google Calendar**

Sucesso: status **Conta Google conectada** + mensagem verde.

---

## Parte G — Testes obrigatórios

### G1. Visualização

- [ ] Menu **Agenda** → calendário embed aparece
- [ ] Painel **Eventos do dia** lista compromissos de hoje (após sincronizar)

### G2. CRUD

- [ ] **Novo evento** → selecionar paciente → criar
- [ ] Evento aparece no Google Calendar
- [ ] Evento aparece na lista do FisioLux
- [ ] Ficha do paciente → aba **Agenda** → evento vinculado listado

### G3. Sincronização

- [ ] Botão **Sincronizar** puxa eventos do Google
- [ ] Editar/excluir no FisioLux reflete no Google

### G4. Webhook (alteração direto no Google)

1. Crie ou edite um evento **no site do Google Calendar** (fora do FisioLux)
2. Aguarde ~1 minuto ou clique **Sincronizar**
3. [ ] Mudança aparece no FisioLux

Se o webhook não registrar sozinho:

- Confirme `APP_URL` com **https://**
- Reconecte: **Desconectar** → **Conectar** de novo em Configurações
- Webhook expira em ~7 dias — reconectar renova (melhoria futura: cron de renovação)

---

## Parte H — Checklist rápido (colar no Notion/Trello)

```text
[ ] HTTPS + APP_URL correto no .env da VPS
[ ] AGENDA_TOKEN_SECRET no .env da VPS
[ ] git pull + docker compose build + up -d
[ ] Google Calendar API ativada
[ ] OAuth Web criado com redirect https://DOMINIO/api/google-calendar/callback
[ ] Usuários de teste no Google (e-mails da clínica)
[ ] Configurações FisioLux: Client ID + Secret + embed salvos
[ ] Conectar conta Google da clínica
[ ] Teste criar evento com paciente
[ ] Teste aba Agenda na ficha do paciente
[ ] Teste sync / editar no Google Calendar
```

---

## Troubleshooting

| Problema | Solução |
| --- | --- |
| **Acesso bloqueado (403)** | Adicionar e-mail em **Usuários de teste** no Google Cloud |
| **Configure Client ID/Secret** | Salvar integração em Configurações antes de conectar |
| **Redirect URI mismatch** | URI no Google = exatamente a mostrada em Configurações |
| **Webhook must be HTTPS** | `APP_URL` deve ser `https://...`; reconectar após corrigir |
| **Conectou mas sync falha** | Desconectar e conectar de novo; ver logs `docker compose logs app` |
| **Embed não aparece** | Preencher URL embed em Configurações; calendário público/incorporável no Google |
| **Evento sem paciente na ficha** | Criar evento selecionando paciente na busca; eventos antigos sem vínculo não aparecem na aba do paciente |

---

## O que NÃO precisa fazer em produção

- Editar código-fonte para trocar credenciais OAuth
- Colocar Client Secret no GitHub
- Usar ngrok (só era para teste local)
- Conta Google do desenvolvedor — use a **conta da clínica** na conexão OAuth

---

## Referências no projeto

- Deploy geral: `docs/DOCKER.md`
- Variáveis: `.env.example`
- Código OAuth: `services/agenda/google-calendar-service.ts`
- UI config: `features/configuracoes/components/agenda-config-form.tsx`

---

*Última atualização: agosto/2026 — branch com integração Google Calendar CRUD + aba Agenda no paciente.*
