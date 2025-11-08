# Sistema de Gestão de Honorários Médicos (SGHM)

Este é um protótipo funcional de frontend para um **Sistema de Gestão de Honorários Médicos**, desenvolvido como parte do Projeto Integrador no UniCEUB.

O objetivo principal deste sistema é substituir o uso de planilhas de Excel para a gestão de honorários médicos, oferecendo uma solução mais segura, eficiente e com controle de acesso para gerenciar o faturamento, pagamentos, glosas e repasses a profissionais de saúde.

---

## � **FUNCIONALIDADES V3.0**

### **🏥 Gestão de Planos de Saúde**
- ✅ **CRUD Completo:** Criar, listar, editar, excluir planos
- ✅ **6 Planos Configurados:** Unimed, Bradesco, Amil, SUS, SulAmérica, Particular
- ✅ **Tipos de Plano:** PUBLICO, PRIVADO, COOPERATIVA, SEGURADORA
- ✅ **Estatísticas:** Total de honorários e consultas por plano
- ✅ **Filtros Avançados:** Por nome, tipo, ativo/inativo

### **💰 Gestão de Honorários Médicos**
- ✅ **Dashboard Financeiro:** Estatísticas dos últimos 30 dias
- ✅ **Controle de Status:** PENDENTE → ENVIADO → PAGO/GLOSADO  
- ✅ **Gestão de Glosas:** Motivos detalhados e controle de perdas
- ✅ **Relatórios Médicos:** Individuais por período e plano
- ✅ **Filtros:** Por médico, plano, status, período
- ✅ **Cálculos:** Taxa de glosa automática (atual: 2.96%)

### **📊 Dashboard e Relatórios**
- ✅ **Visão Geral:** Total processado, pendente, pago, glosado
- ✅ **Estatísticas:** R$ 1.275,00 total atual, 37 endpoints funcionais
- ✅ **Rankings:** Top médicos por valor e consultas
- ✅ **Análise Temporal:** Comparações mensais e semanais
- ✅ **Exportação:** Dados estruturados para relatórios

---

## 🛠️ Tecnologias Utilizadas

- **React** (v18)
- **TypeScript**
- **React Router** (v6) para navegação.
- **React Context API** para gerenciamento de estado global (Perfis de Usuário e Dados CRUD).
- **Recharts** para a visualização de gráficos no Dashboard.
- **React Icons** (v4) para a iconografia.
- CSS moderno para estilização (Flexbox, Grid).

---

## 🏁 Como Rodar o Projeto Localmente

Siga estas instruções para configurar e executar o protótipo na sua máquina.

### Pré-requisitos

Antes de começar, você precisará ter os seguintes softwares instalados:

- [**Node.js**](https://nodejs.org/en/) (versão 16 ou superior)
- [**npm**](https://www.npmjs.com/) (geralmente vem com o Node.js) ou [**Yarn**](https://yarnpkg.com/)
- [**Git**](https://git-scm.com/)

### 1. Clonar o Repositório

Primeiro, clone o repositório do GitHub para a sua máquina local:

```bash
git clone https://github.com/seu-usuario/nome-do-repositorio.git
```

*(Substitua `https://github.com/seu-usuario/nome-do-repositorio.git` pelo URL real do seu repositório no GitHub)*

### 2. Acessar a Pasta do Projeto

Navegue até o diretório que você acabou de clonar:

```bash
cd nome-do-repositorio
```

*(Substitua `nome-do-repositorio` pelo nome da pasta do seu projeto)*

### 3. Instalar as Dependências

Dentro da pasta do projeto, execute o seguinte comando para instalar todas as bibliotecas e pacotes necessários (React, Recharts, etc.) listados no arquivo `package.json`:

```bash
npm install
```

*(Se você usa Yarn, o comando é `yarn install`)*

### 4. Executar o Protótipo

Após a instalação ser concluída, inicie o servidor de desenvolvimento:

```bash
npm start
```

O comando irá iniciar o projeto e abrirá automaticamente uma aba no seu navegador padrão, apontando para **http://localhost:3000**.

O protótipo estará 100% funcional neste endereço.

---

## ℹ️ Nota sobre o Protótipo

- **Simulação de Perfil:** No rodapé do menu lateral (sidebar), você encontrará um botão para alternar entre os perfis **Admin** e **Operador** e testar as restrições de acesso.
- **Persistência de Dados:** Os dados são gerenciados em memória (React Context) e são lidos do arquivo `src/data/mockData.ts`. As alterações (novos médicos, consultas, etc.) são interativas, mas **serão perdidas se você atualizar a página (F5)**, pois o sistema ainda não está conectado a um banco de dados.

---

Este projeto foi desenvolvido com foco em usabilidade, controle de acesso e simulação de um ambiente real de gestão médica.

## Participantes do Grupo:

- CARLOS ALBERTO MORALES DUPONT
- DANIEL TORRES SOUZA
- DIONISMAR RODRIGUES
- KARYNE SOARES SOUSA