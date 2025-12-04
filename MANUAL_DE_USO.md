# 📘 Manual de Uso - SGHM
## Sistema de Gestão de Honorários Médicos

**Versão:** 1.0  
**Data:** Dezembro 2024  
**Desenvolvido por:** Equipe SGHM

---

## 📑 Índice

1. [Introdução](#introdução)
2. [Acesso ao Sistema](#acesso-ao-sistema)
3. [Dashboard](#dashboard)
4. [Gestão de Médicos](#gestão-de-médicos)
5. [Gestão de Pacientes](#gestão-de-pacientes)
6. [Gestão de Planos de Saúde](#gestão-de-planos-de-saúde)
7. [Gestão de Consultas](#gestão-de-consultas)
8. [Gestão de Honorários](#gestão-de-honorários)
9. [Recursos de Glosa](#recursos-de-glosa)
10. [Relatórios](#relatórios)
11. [Perguntas Frequentes](#perguntas-frequentes)

---

## 1. Introdução

### O que é o SGHM?

O **SGHM (Sistema de Gestão de Honorários Médicos)** é uma plataforma completa para gerenciar:

- 👨‍⚕️ **Médicos** e suas especialidades
- 👥 **Pacientes** e seus dados
- 🏥 **Planos de Saúde** e convênios
- 📅 **Consultas** realizadas
- 💰 **Honorários** médicos
- ⚠️ **Glosas** e recursos

### Principais Funcionalidades

✅ Controle completo de honorários médicos  
✅ Gestão de glosas e recursos  
✅ Histórico completo de alterações  
✅ Dashboard com estatísticas  
✅ Relatórios detalhados  
✅ Interface intuitiva e responsiva

---

## 2. Acesso ao Sistema

### 2.1 Fazendo Login

1. **Acesse o sistema** pelo navegador
2. **Digite seu email** cadastrado
3. **Digite sua senha**
4. **Clique em "Entrar"**

![Login](https://via.placeholder.com/800x400/4A90E2/FFFFFF?text=Tela+de+Login)

> [!TIP]
> **Primeiro Acesso?**  
> Entre em contato com o administrador para criar sua conta.

### 2.2 Recuperar Senha

1. Clique em **"Esqueci minha senha"**
2. Digite seu **email cadastrado**
3. Verifique seu **email** para instruções
4. Crie uma **nova senha**

### 2.3 Perfis de Usuário

O sistema possui dois tipos de usuários:

| Perfil | Permissões |
|--------|------------|
| **ADMIN** | Acesso total ao sistema |
| **OPERADOR** | Acesso limitado (sem gestão de usuários) |

---

## 3. Dashboard

### 3.1 Visão Geral

O **Dashboard** é a tela inicial após o login. Apresenta:

📊 **Estatísticas Financeiras**
- Total de honorários
- Valores pendentes
- Valores pagos
- Valores glosados

📈 **Gráficos**
- Honorários por período
- Taxa de glosa
- Desempenho por médico

🔔 **Notificações**
- Glosas recentes
- Recursos pendentes
- Pagamentos atrasados

### 3.2 Navegação

Use o **menu lateral** para acessar:

- 🏠 **Dashboard** - Visão geral
- 👨‍⚕️ **Médicos** - Cadastro de médicos
- 👥 **Pacientes** - Cadastro de pacientes
- 🏥 **Planos** - Planos de saúde
- 📅 **Consultas** - Registro de consultas
- 💰 **Honorários** - Gestão financeira
- 📊 **Relatórios** - Análises e exportações

---

## 4. Gestão de Médicos

### 4.1 Listar Médicos

**Menu:** Médicos → Listar

Visualize todos os médicos cadastrados com:
- Nome completo
- CRM
- Especialidade
- Telefone
- Email
- Status (Ativo/Inativo)

### 4.2 Cadastrar Novo Médico

**Passo a passo:**

1. Clique em **"Novo Médico"**
2. Preencha os dados:
   - **Nome Completo** (obrigatório)
   - **CRM** (obrigatório, único)
   - **Especialidade**
   - **Telefone**
   - **Email**
3. Clique em **"Salvar"**

> [!IMPORTANT]
> O **CRM** deve ser único no sistema. Não é possível cadastrar dois médicos com o mesmo CRM.

### 4.3 Editar Médico

1. Localize o médico na lista
2. Clique no **ícone de edição** (✏️)
3. Altere os dados necessários
4. Clique em **"Salvar"**

### 4.4 Excluir Médico

1. Localize o médico na lista
2. Clique no **ícone de exclusão** (🗑️)
3. **Confirme** a exclusão

> [!CAUTION]
> **Atenção!** Médicos com consultas registradas não podem ser excluídos.

### 4.5 Buscar Médico

Use a **barra de busca** para encontrar médicos por:
- Nome
- CRM
- Especialidade

---

## 5. Gestão de Pacientes

### 5.1 Listar Pacientes

**Menu:** Pacientes → Listar

Visualize todos os pacientes com:
- Nome completo
- CPF
- Data de nascimento
- Telefone
- Email

### 5.2 Cadastrar Novo Paciente

**Passo a passo:**

1. Clique em **"Novo Paciente"**
2. Preencha os dados:
   - **Nome Completo** (obrigatório)
   - **CPF** (obrigatório, único)
   - **Data de Nascimento**
   - **Telefone**
   - **Email**
   - **Endereço**
3. Clique em **"Salvar"**

> [!TIP]
> O CPF é validado automaticamente. Digite apenas números.

### 5.3 Editar Paciente

1. Localize o paciente na lista
2. Clique no **ícone de edição** (✏️)
3. Altere os dados necessários
4. Clique em **"Salvar"**

### 5.4 Excluir Paciente

1. Localize o paciente na lista
2. Clique no **ícone de exclusão** (🗑️)
3. **Confirme** a exclusão

> [!CAUTION]
> Pacientes com consultas registradas não podem ser excluídos.

---

## 6. Gestão de Planos de Saúde

### 6.1 Listar Planos

**Menu:** Planos de Saúde → Listar

Visualize todos os planos com:
- Nome do plano
- Tipo (Particular/Convênio/SUS)
- Valor da consulta
- Prazo de pagamento
- Status

### 6.2 Cadastrar Novo Plano

**Passo a passo:**

1. Clique em **"Novo Plano"**
2. Preencha os dados:
   - **Nome do Plano** (obrigatório)
   - **Tipo** (Particular/Convênio/SUS)
   - **Valor da Consulta**
   - **Prazo de Pagamento** (dias)
   - **Observações**
3. Clique em **"Salvar"**

### 6.3 Tipos de Plano

| Tipo | Descrição |
|------|-----------|
| **Particular** | Pacientes particulares |
| **Convênio** | Planos de saúde privados |
| **SUS** | Sistema Único de Saúde |

### 6.4 Editar Plano

1. Localize o plano na lista
2. Clique no **ícone de edição** (✏️)
3. Altere os dados necessários
4. Clique em **"Salvar"**

---

## 7. Gestão de Consultas

### 7.1 Registrar Nova Consulta

**Menu:** Consultas → Nova Consulta

**Passo a passo:**

1. Clique em **"Nova Consulta"**
2. Selecione o **Médico**
3. Selecione o **Paciente**
4. Selecione o **Plano de Saúde**
5. Informe a **Data da Consulta**
6. Informe o **Valor** (preenchido automaticamente)
7. Adicione **Observações** (opcional)
8. Clique em **"Salvar"**

> [!NOTE]
> Ao salvar a consulta, um **honorário** é criado automaticamente!

### 7.2 Listar Consultas

Visualize todas as consultas com:
- Data
- Médico
- Paciente
- Plano
- Valor
- Status do honorário

### 7.3 Filtrar Consultas

Use os filtros para encontrar consultas por:
- **Período** (data início e fim)
- **Médico**
- **Paciente**
- **Plano de Saúde**
- **Status**

### 7.4 Editar Consulta

1. Localize a consulta na lista
2. Clique no **ícone de edição** (✏️)
3. Altere os dados necessários
4. Clique em **"Salvar"**

> [!WARNING]
> Alterar o valor da consulta **atualiza automaticamente** o honorário vinculado.

---

## 8. Gestão de Honorários

### 8.1 Visão Geral

**Menu:** Honorários → Gestão

O módulo de honorários permite:
- ✅ Visualizar todos os honorários
- ✅ Filtrar por período, médico, plano
- ✅ Marcar como enviado/pago
- ✅ Registrar glosas
- ✅ Enviar recursos contra glosas
- ✅ Ver histórico completo

### 8.2 Status de Honorários

| Status | Descrição | Cor |
|--------|-----------|-----|
| **PENDENTE** | Aguardando envio ao plano | 🟡 Amarelo |
| **ENVIADO** | Enviado ao plano, aguardando pagamento | 🔵 Azul |
| **PAGO** | Pago pelo plano | 🟢 Verde |
| **GLOSADO** | Rejeitado pelo plano | 🔴 Vermelho |

### 8.3 Filtrar Honorários

Use os filtros disponíveis:

**Filtros Básicos:**
- 🔍 **Busca** - Nome do médico ou plano
- 📅 **Período** - Data início e fim
- 👨‍⚕️ **Médico** - Filtrar por médico específico
- 🏥 **Plano** - Filtrar por plano específico
- 📊 **Status** - Pendente/Enviado/Pago/Glosado

**Filtros Avançados:**
- ⚠️ **Apenas com Glosa** - Mostrar só glosados
- 📄 **Com Recurso** - Mostrar com recurso enviado

### 8.4 Ações em Lote

Selecione múltiplos honorários e:

**Marcar como Enviado:**
1. Selecione os honorários (checkbox)
2. Clique em **"Marcar como Enviado"**
3. Confirme a ação

**Marcar como Pago:**
1. Selecione os honorários (checkbox)
2. Clique em **"Marcar como Pago"**
3. Confirme a ação

**Registrar Glosa:**
1. Selecione os honorários (checkbox)
2. Clique em **"Registrar Glosa"**
3. Preencha:
   - **Valor da Glosa** (ou deixe em branco para glosa total)
   - **Motivo da Glosa**
   - **Data da Glosa**
4. Confirme

> [!TIP]
> Use **Ctrl + Click** para selecionar múltiplos honorários não consecutivos.

### 8.5 Ver Histórico

Para ver o histórico completo de um honorário:

1. Localize o honorário
2. Clique no **ícone de histórico** (🕐)
3. Visualize todas as alterações:
   - Data e hora
   - Usuário responsável
   - Tipo de evento
   - Descrição
   - Dados adicionais

**Tipos de Evento:**
- 📝 **STATUS_ALTERADO** - Mudança de status
- ⚠️ **GLOSA** - Registro de glosa
- 📄 **RECURSO_ENVIADO** - Recurso contra glosa
- ✅ **RECURSO_RESPONDIDO** - Resposta do recurso

---

## 9. Recursos de Glosa

### 9.1 O que é um Recurso?

Um **recurso** é uma contestação formal contra uma glosa aplicada pelo plano de saúde. Permite:
- ✅ Justificar o procedimento
- ✅ Solicitar revisão
- ✅ Recuperar valores glosados

### 9.2 Enviar Recurso

**Passo a passo:**

1. Localize o honorário **GLOSADO**
2. Clique no botão **"Enviar Recurso"** (📄)
3. Preencha o formulário:
   - **Data do Recurso**
   - **Motivo do Recurso** (justificativa detalhada)
4. Clique em **"Enviar Recurso"**

> [!IMPORTANT]
> Apenas honorários com status **GLOSADO** podem ter recurso enviado.

### 9.3 Status do Recurso

Após enviar o recurso, ele pode ter os seguintes status:

| Status | Descrição | Ícone |
|--------|-----------|-------|
| **PENDENTE** | Aguardando análise do plano | ⏳ |
| **ACEITO_TOTAL** | Recurso aceito integralmente | ✅ |
| **ACEITO_PARCIAL** | Recurso aceito parcialmente | ⚠️ |
| **NEGADO** | Recurso negado | ❌ |

### 9.4 Atualizar Status do Recurso

Quando o plano responder ao recurso:

1. Localize o honorário com recurso
2. Clique no **ícone verde** (✅)
3. Selecione o **Status do Recurso**:
   - **Aceito Totalmente** - Valor integral recuperado
   - **Aceito Parcialmente** - Informe o valor recuperado
   - **Negado** - Glosa mantida
4. Se parcial, informe o **Valor Recuperado**
5. Clique em **"Confirmar"**

### 9.5 Visualizar Recursos

**Filtrar honorários com recurso:**
1. Vá em **Honorários → Gestão**
2. Ative o filtro **"Com Recurso"**
3. Visualize todos os honorários que têm recurso

**Identificação visual:**
- 📄 **Quadrado vazio** - Pode enviar recurso
- ✅ **Ícone verde** - Recurso enviado
- 🏷️ **Badge colorido** - Status do recurso

---

## 10. Relatórios

### 10.1 Relatório de Honorários

**Menu:** Relatórios → Honorários

Gere relatórios detalhados com:
- Total de honorários por período
- Valores por status
- Taxa de glosa
- Desempenho por médico
- Desempenho por plano

### 10.2 Exportar Dados

**Formatos disponíveis:**
- 📄 **PDF** - Relatório formatado
- 📊 **Excel** - Planilha editável
- 📋 **CSV** - Dados brutos

**Como exportar:**
1. Configure os filtros desejados
2. Clique em **"Exportar"**
3. Escolha o formato
4. Aguarde o download

### 10.3 Estatísticas

Visualize estatísticas em tempo real:

**Financeiras:**
- 💰 Valor total de honorários
- ⏳ Valores pendentes
- ✅ Valores pagos
- ⚠️ Valores glosados
- 📈 Taxa de glosa (%)

**Operacionais:**
- 👨‍⚕️ Número de médicos ativos
- 👥 Número de pacientes
- 📅 Consultas no período
- 💼 Honorários no período

---

## 11. Perguntas Frequentes

### 11.1 Acesso e Segurança

**P: Esqueci minha senha, o que faço?**  
R: Use a opção "Esqueci minha senha" na tela de login. Você receberá um email com instruções.

**P: Posso ter mais de um usuário?**  
R: Sim! O administrador pode criar quantos usuários forem necessários.

**P: Meus dados estão seguros?**  
R: Sim! Todos os dados são criptografados e armazenados em banco de dados seguro.

### 11.2 Cadastros

**P: Posso cadastrar médicos com o mesmo CRM?**  
R: Não. O CRM deve ser único no sistema.

**P: Posso excluir um médico que tem consultas?**  
R: Não. Para manter a integridade dos dados, médicos com consultas não podem ser excluídos.

**P: Como edito dados de um paciente?**  
R: Clique no ícone de edição (✏️) ao lado do paciente na listagem.

### 11.3 Consultas e Honorários

**P: O honorário é criado automaticamente?**  
R: Sim! Ao registrar uma consulta, o honorário é criado automaticamente.

**P: Posso alterar o valor de um honorário?**  
R: Sim, editando a consulta vinculada. O honorário será atualizado automaticamente.

**P: Como marco vários honorários como pagos de uma vez?**  
R: Use a seleção múltipla (checkboxes) e clique em "Marcar como Pago".

### 11.4 Glosas e Recursos

**P: O que é uma glosa?**  
R: É quando o plano de saúde rejeita total ou parcialmente o pagamento de um honorário.

**P: Posso enviar recurso contra qualquer glosa?**  
R: Sim! Todo honorário glosado pode ter recurso enviado.

**P: O histórico fica salvo?**  
R: Sim! Todas as alterações ficam registradas permanentemente no histórico.

**P: Posso ver quem fez cada alteração?**  
R: Sim! O histórico mostra o usuário, data, hora e detalhes de cada ação.

### 11.5 Relatórios

**P: Posso exportar os dados?**  
R: Sim! Você pode exportar em PDF, Excel ou CSV.

**P: Os relatórios são em tempo real?**  
R: Sim! Todos os dados são atualizados instantaneamente.

**P: Posso filtrar por período?**  
R: Sim! Use os filtros de data início e data fim.

---

## 📞 Suporte

**Precisa de ajuda?**

📧 **Email:** suporte@sghm.com  
📱 **WhatsApp:** (11) 99999-9999  
🌐 **Site:** www.sghm.com.br

**Horário de Atendimento:**  
Segunda a Sexta: 8h às 18h  
Sábado: 8h às 12h

---

## 📝 Notas de Versão

**Versão 1.0 - Dezembro 2024**

✅ Lançamento inicial do sistema  
✅ Gestão completa de honorários  
✅ Recursos de glosa implementados  
✅ Histórico de auditoria  
✅ Dashboard com estatísticas  
✅ Relatórios e exportações

---

**© 2024 SGHM - Sistema de Gestão de Honorários Médicos**  
**Todos os direitos reservados.**
