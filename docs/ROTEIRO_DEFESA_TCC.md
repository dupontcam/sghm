# Roteiro de Defesa (15–20 min)

Objetivo: Defender que o SGHM resolve a dor de clínicas que gerenciam consultas e honorários com Excel, trazendo controle, segurança e eficiência.

## 1. Abertura (1 min)
- Contexto: clínicas usando planilhas → erros, duplicidades, falta de histórico e controles.
- Proposta: SGHM — Sistema de Gestão de Honorários Médicos.

## 2. Dor do Cliente (2 min)
- Planilhas não escalam: múltiplos arquivos, versões divergentes, acesso concorrente.
- Falta de rastreabilidade: quem alterou, quando, por quê.
- Conciliação difícil: glosas, pagamentos, status pendentes dispersos.
- Segurança precária: dados sensíveis sem controle de acesso.

## 3. Solução SGHM (4–5 min)
- Arquitetura:
  - Frontend React + TypeScript (UX simples, acesso por perfil).
  - Backend Node.js + Express + Prisma (Postgres), JWT, validações.
  - Banco PostgreSQL (Neon/Render), migração e integridade de dados.
- Fluxos principais:
  - Autenticação e perfis (ADMIN/OPERADOR) com rate limit e CORS.
  - Gestão de usuários: CRUD com salvaguardas (não excluir a si mesmo/último ADMIN).
  - Gestão de honorários: status PENDENTE/ENVIADO/PAGO/GLOSADO, histórico e métricas.
  - Consultas: cadastro, status de pagamento, integração com planos.
  - Planos: criação/atualização por ADMIN/OPERADOR, regras de desativação/exclusão.
- Dashboard/Estatísticas: visão de desempenho, glosas, valores pagos/pendentes.

## 4. Demonstração (6–7 min)
- Login no ambiente produção (Vercel + Render + Neon).
- Cadastro rápido (consulta + honorário), atualização de status.
- Criação/edição de plano por OPERADOR.
- Visualização de estatísticas e filtros.
- Usuários: criar/excluir com regras.
- Backup local (dev) como demonstração; mencionar endpoints de backup em produção (stub) já criados.

## 5. Segurança e Confiabilidade (2 min)
- JWT, rate limit com proxy-aware, CORS para domínio.
- Validações com express-validator.
- Regras de permissão por role nas rotas.
- Backups: estratégia evolutiva (ver próximos passos).

## 6. Próximos Passos (2–3 min)
- Backup/Restore produção:
  - Implementar export streaming (JSON/NDJSON) e import transacional com dry-run.
  - Criptografia, checksum e histórico persistente com metadados.
  - Job de backup automático para storage (S3/Blob) e PITR do banco.
- Observabilidade:
  - Logs estruturados, métricas e alertas de erros/latência.
- UX:
  - Melhorias de acessibilidade, filtros avançados, busca global.
- Integrações:
  - Faturamento, emissão de boletos/PIX, webhooks.
- Compliance:
  - LGPD: políticas de retenção, mascaramento, consentimento.

## 7. Encerramento (1 min)
- Recapitular valor: sair do caos das planilhas para um sistema confiável.
- Impacto: redução de erros, ganho de tempo, visibilidade financeira.
- Convite: evoluir o produto com apoio da banca/investidores.

## Apêndice: Script resumido
- Apresente a dor com exemplo real de planilha.
- Mostre login, fluxo de cadastro, atualização de status e dashboard.
- Destaque permissão por perfil e salvaguardas (usuários/planos).
- Cite o plano de backup e a robustez futura.
- Reforce benefícios: eficiência e segurança.
