# 🚀 GUIA DE EXECUÇÃO LOCAL - SGHM

## ✅ Pré-requisitos Verificados

- ✅ PostgreSQL rodando (Docker)
- ✅ Backend configurado
- ✅ Migrações aplicadas
- ✅ Usuário admin criado

---

## 📋 Credenciais de Acesso

**Email:** `admin@sghm.com`  
**Senha:** `admin123`  
**Role:** ADMIN

---

## 🧩 Histórico (opcional)

Para apresentação, mantenha o histórico desabilitado (evita exibir botões e modal de histórico enquanto a funcionalidade não estiver homologada).

Como configurar (frontend `.env`):
```
REACT_APP_ENABLE_HISTORY=false
```

Reinicie o frontend após alterar o `.env`:
```
cd c:\SGHM\sghm
npm start
```

Habilitar em desenvolvimento (se necessário para testes):
```
REACT_APP_ENABLE_HISTORY=true
```

Observações:
- Se a variável não estiver definida, o histórico permanece desabilitado por padrão.
- Quando desabilitado, a UI oculta os botões de histórico e o modal correspondente.

---

## 🎯 Como Rodar o Sistema

### 1️⃣ Backend (já está rodando!)

O backend já está ativo na porta **3001**.

Se precisar reiniciar:
```bash
cd backend
npm run dev
```

**URL da API:** http://localhost:3001/api

### 2️⃣ Frontend

Abra um **novo terminal** e execute:
```bash
cd c:\SGHM\sghm
npm start
```

O frontend abrirá automaticamente em: **http://localhost:3000**

---

## 🔐 Fazer Login

1. Acesse http://localhost:3000
2. Use as credenciais:
   - **Email:** admin@sghm.com
   - **Senha:** admin123
3. Clique em "Entrar"

---

## ✨ Funcionalidades Disponíveis

### ✅ Totalmente Funcionais (Fase 1 Completa)

- **Gestão de Honorários**
  - ✅ Listar honorários
  - ✅ Filtrar por médico, plano, status, data
  - ✅ Registrar glosas
  - ✅ **Enviar recurso de glosa** (NOVO!)
  - ✅ **Atualizar status do recurso** (NOVO!)
  - ✅ **Ver histórico completo** (NOVO!)
  - ✅ Ações em lote (marcar como enviado/pago)

- **Gestão de Médicos**
  - ✅ Listar, criar, editar médicos
  - ✅ Validação de CRM único

- **Gestão de Pacientes**
  - ✅ Listar, criar, editar pacientes
  - ✅ Validação de CPF único

- **Gestão de Planos de Saúde**
  - ✅ Listar, criar, editar planos
  - ✅ Configurar valores e prazos

- **Gestão de Consultas**
  - ✅ Registrar consultas
  - ✅ Vincular médico, paciente e plano
  - ✅ Gerar honorários automaticamente

- **Dashboard**
  - ✅ Estatísticas financeiras
  - ✅ Gráficos de desempenho
  - ✅ Indicadores de glosa

---

## 🆕 Novidades da Fase 1

### Recursos de Glosa (100% Funcional)

**1. Enviar Recurso**
- Acesse "Gestão de Honorários"
- Encontre um honorário GLOSADO
- Clique no botão "Enviar Recurso"
- Preencha o motivo
- Dados salvos no PostgreSQL!

**2. Atualizar Status do Recurso**
- Honorários com recurso enviado mostram ícone verde
- Clique no ícone para atualizar status
- Opções: Aceito Total, Aceito Parcial, Negado
- Valor recuperado calculado automaticamente

**3. Ver Histórico**
- Clique no ícone de histórico (relógio)
- Veja todas as alterações do honorário
- Inclui: usuário, data, tipo de evento, descrição
- Dados vêm direto do banco!

---

## 🗄️ Persistência de Dados

### ✅ Tudo Salvo no PostgreSQL

**Antes (localStorage):**
- ❌ Dados perdidos ao limpar navegador
- ❌ Não sincroniza entre dispositivos
- ❌ Sem auditoria

**Agora (PostgreSQL):**
- ✅ Dados persistentes
- ✅ Sincronização automática
- ✅ Histórico completo de auditoria
- ✅ Backup automático

---

## 🔍 Verificar se Está Funcionando

### Teste Rápido

1. **Login**
   - Faça login com admin@sghm.com
   - Deve funcionar sem erros

2. **Criar Médico**
   - Vá em "Médicos" → "Novo Médico"
   - Preencha os dados
   - Salvar deve funcionar

3. **Criar Plano**
   - Vá em "Planos de Saúde" → "Novo Plano"
   - Preencha os dados
   - Salvar deve funcionar

4. **Criar Paciente**
   - Vá em "Pacientes" → "Novo Paciente"
   - Preencha os dados
   - Salvar deve funcionar

5. **Registrar Consulta**
   - Vá em "Consultas" → "Nova Consulta"
   - Selecione médico, paciente e plano
   - Preencha valor e data
   - Salvar deve criar honorário automaticamente

6. **Testar Recurso de Glosa**
   - Vá em "Honorários"
   - Registre uma glosa em algum honorário
   - Clique em "Enviar Recurso"
   - Preencha motivo
   - Deve salvar no banco!

---

## 🐛 Troubleshooting

### Backend não inicia
```bash
# Verificar se PostgreSQL está rodando
docker ps

# Reiniciar backend
cd backend
npm run dev
```

### Frontend não conecta ao backend
- Verifique se backend está rodando na porta 3001
- Abra http://localhost:3001/api no navegador
- Deve mostrar mensagem da API

### Erro de autenticação
- Verifique se o usuário foi criado:
```bash
cd backend
node scripts/criar-usuario-admin.js
```

### Dados não aparecem
- Abra o console do navegador (F12)
- Verifique se há erros de API
- Verifique se o token está sendo enviado

---

## 📊 Monitoramento

### Logs do Backend
O backend mostra logs detalhados:
- ✅ Requisições recebidas
- ✅ Queries ao banco
- ✅ Erros (se houver)

### Console do Frontend
Abra F12 no navegador para ver:
- ✅ Chamadas à API
- ✅ Dados recebidos
- ✅ Erros (se houver)

---

## 🎉 Sistema Pronto!

O sistema está **100% funcional** localmente com:
- ✅ Backend integrado com PostgreSQL
- ✅ Frontend conectado ao backend
- ✅ Recursos de glosa totalmente funcionais
- ✅ Histórico de auditoria completo
- ✅ Sem dependência de localStorage

**Bom uso! 🚀**
