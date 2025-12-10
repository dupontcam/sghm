# Roteiro de Apresentação Simples (10–12 min)

Objetivo: apresentar o SGHM de forma direta, focando na dor (planilhas) e mostrando como o sistema resolve com segurança e eficiência.

## 1) Contexto e Dor (1 min)
- Muitas clínicas usam planilhas para controlar consultas e honorários.
- Problemas: erros de digitação, versões diferentes, dificuldade de conciliação, falta de histórico e segurança.

## 2) Proposta (30s)
- SGHM: Sistema de Gestão de Honorários Médicos (web) com autenticação, controle por perfis e dados centralizados.

## 3) Tecnologias (30s)
- Frontend: React + TypeScript.
- Backend: Node.js + Express + Prisma.
- Banco: PostgreSQL.
- Autenticação JWT, validação, CORS, rate limit.

## 4) Login e Perfis (1 min)
- Mostrar a tela de login.
- Perfis: ADMIN e OPERADOR.
- Explicar restrições: ADMIN gerencia usuários e tem acesso a backup; OPERADOR cuida do dia a dia (consultas/honorários/planos).

## 5) Fluxos Principais (6–7 min)
- Usuários:
  - Criar novo usuário OPERADOR (ADMIN).
  - Explicar salvaguardas (não excluir a si mesmo/último ADMIN).
- Planos de Saúde:
  - Criar e editar plano (OPERADOR permitido).
  - Mostrar listagem, filtros e estado ativo.
- Médicos e Pacientes:
  - Cadastro simples (campos essenciais e validação).
  - Mostrar busca/listagem.
- Consultas + Honorários:
  - Criar consulta vinculando médico, paciente e plano.
  - Atualizar status de pagamento do honorário (PENDENTE/ENVIADO/PAGO/GLOSADO).
  - Comentar impacto de glosa e indicadores.
- Dashboard/Estatísticas:
  - Visão resumida: valores pagos/pendentes, glosa média, total de consultas.

## 6) Backup (1 min)
- Em produção, backup via servidor (ADMIN): exporta JSON e valida import (dry-run).
- Em desenvolvimento, existe backup local (oculto em produção).

## 7) Encerramento (1 min)
- Benefícios: menos erros que planilhas, dados centralizados, controle por perfil, visão financeira clara.
- Próximos passos: aprimorar backup/restauração (transacional), observabilidade, integrações financeiras e compliance.

## Dicas para a Apresentação
- Use dados curtos e nomes claros (ex.: Dr. Teste, Paciente Demo).
- Mostre apenas o necessário por tela (login → usuários → planos → consultas → honorários → dashboard).
- Evite pausas longas: narre o que está fazendo e o porquê.
- Finalize reforçando que o sistema substitui as planilhas com controle e segurança.
