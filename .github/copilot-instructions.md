# SGHM – Instruções para Agentes de IA

Objetivo: tornar você produtivo rapidamente no SGHM documentando arquitetura, fluxos de trabalho e convenções reais usadas neste repo.

## Visão Geral
- Frontend: React + TypeScript em `sghm/src`, roteamento (React Router), estado por Contexts e camada de serviços em `src/services/*.ts`.
- Backend: Node.js + Express em `sghm/backend`, ORM Prisma + PostgreSQL, autenticação JWT, validação via `express-validator`.
- Banco: PostgreSQL (Docker opcional em `backend/docker-compose.yml`). Esquema em `backend/prisma/schema.prisma` (vide enums `status_honorario`, `tipo_plano`, etc.).
- API: prefixo `/api` com rotas em `backend/routes/` (auth, medicos, pacientes, consultas, planos, honorarios, estatisticas, relatorios).

## Como Rodar (desenvolvimento)
- Backend (porta 3001):
  - `cd sghm\backend`
  - `npm install`
  - `docker-compose up -d` (Postgres local)
  - Configure `backend/.env` (veja `ENV-CONFIG-STATUS.md`); execute `npx prisma migrate deploy` e `node scripts/criar-usuario-admin.js`
  - `npm run dev` (obs: não há `start` script; use `dev`)
- Frontend (porta 3000):
  - `cd sghm`
  - `npm install`
  - `.env` com `REACT_APP_API_URL=http://localhost:3001/api`
  - `npm start`
- Login padrão: `admin@sghm.com` / `admin123`.

## Padrões de Integração (Frontend)
- Base de API: `src/services/api.ts` usa `REACT_APP_API_URL` e `fetch` com helper `fetchAPI()` (inclui `Authorization: Bearer <token>` quando presente).
- Token: salvo em `localStorage` como `sghm_token` via `tokenManager` (em `api.ts`).
- Transformações: cada recurso tem funções `transform*ToBackend` e `transform*FromBackend` (ex.: mapeia status e campos `snake_case` ⇄ `camelCase`, ajusta datas com `T12:00:00.000Z` para evitar fuso horário).
- Serviços existentes: `medicosAPI`, `pacientesAPI`, `consultasAPI`, `planosAPI`, `honorariosAPI`, `estatisticasAPI`, `authAPI` em `src/services/api.ts`.

## Padrões de API (Backend)
- Autenticação: `POST /api/auth/login` com `{ email, senha }` retorna `{ success, data: { token, refreshToken, user } }`.
- Proteção: use `authenticateToken` + `requireAdmin`/`requireAuth` de `backend/middleware/auth.js` nas rotas.
- Validação: use validadores de `backend/middleware/validators.js` (ex.: `validateMedico.create`, `validateAuth.login`).
- Erros: respostas seguem `{ success: false, error, code, details? }` com `400/401/403/409/500` conforme o caso.
- Convenções de status: honorários usam `PENDENTE|ENVIADO|PAGO|GLOSADO`; consultas usam `status_pagamento` (`PENDENTE|PAGO|GLOSA`). Frontend faz mapeamentos em `api.ts`.

## Fluxos Importantes
- Honorários:
  - GET/PUT/PATCH em `/api/honorarios`; atualizações de status via `PUT /api/honorarios/:id/status { status_pagamento }` e glosa via `PUT /api/honorarios/:id/glosa`.
  - Histórico e recursos: endpoints específicos em `honorarios` (veja `honorariosAPI` para formatos esperados).
- Estatísticas/Dashboard: front consome `/api/estatisticas/resumo` e transforma para cards do dashboard.
- Usuários/Admin: criação via `POST /api/auth/create-user` (ADMIN), listagem `GET /api/auth/users`.

## Como Estender
- Backend: crie novas rotas em `backend/routes/*.js`, aplique middlewares de auth/validação, e use Prisma (`@prisma/client`). Se alterar o modelo, atualize `prisma/schema.prisma` e gere migrações.
- Frontend: adicione funções no serviço correspondente em `src/services/api.ts` (ou crie um novo arquivo em `src/services/`) seguindo o padrão `fetchAPI + transform*`. Atualize Contexts/Components que consomem esses serviços.

## Testes e Diagnóstico
- Smoke test de API: `node backend/test-apis-simple.js` (instale `node-fetch@2` se necessário). Observação: `backend/test-endpoints.js` está desatualizado (usa `password` em vez de `senha` e estrutura de resposta antiga).
- Verificação de ambiente: `check-config.bat` e `ENV-CONFIG-STATUS.md` (passos, variáveis, próximos passos).
- Logs úteis: backend imprime etapas de boot e carregamento de rotas (`server.js`), frontend loga chamadas no console via `fetchAPI`.

## Segurança e CORS
- Variáveis sensíveis em `.env`/`backend/.env` (não commitar). Em produção, troque `JWT_SECRET`/`JWT_REFRESH_SECRET` e `DATABASE_URL` (veja `ENV-CONFIG-STATUS.md`).
- CORS: `server.js` permite `http://localhost:3000` e `http://localhost:3001` em dev, e origem configurável em prod.

## Gotchas
- `backend/package.json` não define `start`; use `npm run dev`.
- Datas: envie ISO completo; quando vier sem hora, ajuste para meio-dia local (`T12:00:00.000Z`) para evitar problemas de timezone.
- Enum de status de honorários no backend é `GLOSADO` (não `GLOSA`).
