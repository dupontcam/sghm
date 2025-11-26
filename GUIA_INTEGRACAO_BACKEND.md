# Guia de Integração Backend - SGHM
**Branch:** production-integration  
**Objetivo:** Integrar frontend React com backend Node.js/Express  
**Data:** 26 de novembro de 2025

---

## 📋 PRÉ-REQUISITOS

Antes de iniciar, certifique-se de que você tem:

- ✅ Backend pronto (Node.js + Express + Prisma)
- ✅ Banco Neon PostgreSQL configurado
- ✅ Git instalado e configurado
- ✅ Node.js 18+ instalado
- ✅ Editor de código (VS Code recomendado)
- ✅ Credenciais do Neon (DATABASE_URL)

---

## 🚀 FASE 1: CONFIGURAÇÃO INICIAL (30 minutos)

### Passo 1.1: Verificar Branch Atual
```bash
# Confirmar que está na branch production-integration
git branch

# Se não estiver, criar/mudar para a branch
git checkout -b production-integration
```

### Passo 1.2: Criar Arquivo de Variáveis de Ambiente
```bash
# Na raiz do projeto frontend (c:\SGHM\sghm)
# Criar arquivo .env
```

**Conteúdo do `.env`:**
```env
# Backend API URL (temporário - localhost)
REACT_APP_API_URL=http://localhost:3001

# Após deploy no Render, alterar para:
# REACT_APP_API_URL=https://sghm-api.onrender.com
```

### Passo 1.3: Adicionar .env ao .gitignore
```bash
# Verificar se .env já está no .gitignore
# Se não estiver, adicionar a linha:
.env
.env.local
```

### Passo 1.4: Instalar Dependência (se necessário)
```bash
# Na raiz do projeto frontend
npm install axios
```

---

## 🔧 FASE 2: MODIFICAR DataContext.tsx (2-3 horas)

### Passo 2.1: Backup do DataContext Atual
```bash
# Criar backup antes de modificar
copy src\contexts\DataContext.tsx src\contexts\DataContext.backup.tsx
```

### Passo 2.2: Estrutura da Modificação

**Localização:** `src/contexts/DataContext.tsx`

**Mudanças necessárias:**

1. **Importar Axios no topo do arquivo:**
```typescript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
```

2. **Criar função auxiliar para headers de autenticação:**
```typescript
const getAuthHeaders = () => {
  const token = localStorage.getItem('sghm_token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};
```

3. **Modificar funções CRUD (exemplo - Médicos):**

**ANTES (Mock Data):**
```typescript
const addMedico = (medico: Omit<Medico, 'id'>) => {
  const newMedico = { ...medico, id: Date.now() };
  setMedicos([...medicos, newMedico]);
};
```

**DEPOIS (API REST):**
```typescript
const addMedico = async (medico: Omit<Medico, 'id'>) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/medicos`,
      medico,
      getAuthHeaders()
    );
    setMedicos([...medicos, response.data]);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Erro ao adicionar médico:', error);
    return { success: false, error: 'Falha ao adicionar médico' };
  }
};
```

### Passo 2.3: Checklist de Funções a Modificar

**Médicos:**
- [ ] `addMedico()` → POST /api/medicos
- [ ] `updateMedico()` → PUT /api/medicos/:id
- [ ] `deleteMedico()` → DELETE /api/medicos/:id
- [ ] Carregar médicos → GET /api/medicos

**Pacientes:**
- [ ] `addPaciente()` → POST /api/pacientes
- [ ] `updatePaciente()` → PUT /api/pacientes/:id
- [ ] `deletePaciente()` → DELETE /api/pacientes/:id
- [ ] Carregar pacientes → GET /api/pacientes

**Planos de Saúde:**
- [ ] `addPlanoSaude()` → POST /api/planos
- [ ] `updatePlanoSaude()` → PUT /api/planos/:id
- [ ] `deletePlanoSaude()` → DELETE /api/planos/:id
- [ ] Carregar planos → GET /api/planos

**Consultas:**
- [ ] `addConsulta()` → POST /api/consultas
- [ ] `updateConsulta()` → PUT /api/consultas/:id
- [ ] `deleteConsulta()` → DELETE /api/consultas/:id
- [ ] Carregar consultas → GET /api/consultas

**Honorários:**
- [ ] `addHonorario()` → POST /api/honorarios
- [ ] `updateHonorario()` → PUT /api/honorarios/:id
- [ ] `deleteHonorario()` → DELETE /api/honorarios/:id
- [ ] `updateStatusHonorario()` → PATCH /api/honorarios/:id/status
- [ ] Carregar honorários → GET /api/honorarios

### Passo 2.4: Adicionar Estados de Loading e Erro

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Adicionar ao contexto value
value={{
  // ... dados existentes
  loading,
  error,
  setError
}}
```

### Passo 2.5: Implementar useEffect para Carregar Dados Iniciais

```typescript
useEffect(() => {
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [medicosRes, pacientesRes, planosRes, consultasRes, honorariosRes] = 
        await Promise.all([
          axios.get(`${API_URL}/api/medicos`, getAuthHeaders()),
          axios.get(`${API_URL}/api/pacientes`, getAuthHeaders()),
          axios.get(`${API_URL}/api/planos`, getAuthHeaders()),
          axios.get(`${API_URL}/api/consultas`, getAuthHeaders()),
          axios.get(`${API_URL}/api/honorarios`, getAuthHeaders())
        ]);

      setMedicos(medicosRes.data);
      setPacientes(pacientesRes.data);
      setPlanosSaude(planosRes.data);
      setConsultas(consultasRes.data);
      setHonorarios(honorariosRes.data);
    } catch (err) {
      setError('Falha ao carregar dados iniciais');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  loadInitialData();
}, []);
```

---

## 🔐 FASE 3: MODIFICAR AuthContext.tsx (1-2 horas)

### Passo 3.1: Localização
**Arquivo:** `src/contexts/AuthContext.tsx`

### Passo 3.2: Modificar Função de Login

**ANTES (Mock):**
```typescript
const login = (email: string, password: string) => {
  const user = mockUsers.find(u => u.email === email && u.password === password);
  if (user) {
    setUser(user);
    localStorage.setItem('sghm_user', JSON.stringify(user));
  }
};
```

**DEPOIS (API):**
```typescript
const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password
    });

    const { user, token } = response.data;
    
    setUser(user);
    localStorage.setItem('sghm_user', JSON.stringify(user));
    localStorage.setItem('sghm_token', token);
    
    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Falha no login' 
    };
  }
};
```

### Passo 3.3: Adicionar Verificação de Token ao Iniciar

```typescript
useEffect(() => {
  const token = localStorage.getItem('sghm_token');
  const storedUser = localStorage.getItem('sghm_user');
  
  if (token && storedUser) {
    // Verificar se token é válido
    axios.get(`${API_URL}/api/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(() => {
      setUser(JSON.parse(storedUser));
    })
    .catch(() => {
      // Token inválido - limpar
      logout();
    });
  }
}, []);
```

---

## 🧪 FASE 4: TESTES LOCAIS (1-2 horas)

### Passo 4.1: Iniciar Backend Localmente

```bash
# Em outro terminal, navegar até pasta do backend
cd c:\SGHM\sghm\backend

# Instalar dependências (se necessário)
npm install

# Rodar migrations do Prisma
npx prisma migrate dev

# Iniciar servidor
npm start

# Backend deve estar rodando em http://localhost:3001
```

### Passo 4.2: Iniciar Frontend

```bash
# Terminal principal (pasta frontend)
cd c:\SGHM\sghm

# Iniciar aplicação React
npm start

# Frontend deve abrir em http://localhost:3000
```

### Passo 4.3: Checklist de Testes

**Login/Autenticação:**
- [ ] Login com credenciais válidas funciona
- [ ] Login com credenciais inválidas mostra erro
- [ ] Token JWT é salvo no localStorage
- [ ] Logout limpa token e redireciona
- [ ] Rotas protegidas verificam token

**CRUD Médicos:**
- [ ] Listar todos os médicos
- [ ] Cadastrar novo médico
- [ ] Editar médico existente
- [ ] Excluir médico
- [ ] Mensagens de erro apropriadas

**CRUD Pacientes:**
- [ ] Listar todos os pacientes
- [ ] Cadastrar novo paciente
- [ ] Editar paciente existente
- [ ] Excluir paciente
- [ ] CPF único validado

**CRUD Planos de Saúde:**
- [ ] Listar todos os planos
- [ ] Cadastrar novo plano
- [ ] Editar plano existente
- [ ] Excluir plano

**CRUD Consultas:**
- [ ] Listar todas as consultas
- [ ] Criar nova consulta
- [ ] Editar consulta
- [ ] Excluir consulta
- [ ] Filtros funcionam corretamente

**Gestão de Honorários:**
- [ ] Listar honorários
- [ ] Criar honorário vinculado a consulta
- [ ] Atualizar status (PENDENTE → ENVIADO → PAGO)
- [ ] Registrar glosas
- [ ] Cálculos de valores corretos

**Dashboard:**
- [ ] Estatísticas carregam corretamente
- [ ] Gráficos exibem dados reais
- [ ] Taxa de glosa calculada
- [ ] Tempo médio de pagamento calculado

**Relatórios:**
- [ ] Relatório geral gerado
- [ ] Filtros funcionam
- [ ] Exportação PDF funciona
- [ ] Dados condizem com banco

---

## 🐛 FASE 5: TRATAMENTO DE ERROS (1 hora)

### Passo 5.1: Criar Componente de Loading Global

**Arquivo:** `src/components/LoadingSpinner.tsx`

```typescript
import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-spinner-overlay">
      <div className="loading-spinner"></div>
      <p>Carregando...</p>
    </div>
  );
};

export default LoadingSpinner;
```

### Passo 5.2: Criar Componente de Erro Global

**Arquivo:** `src/components/ErrorMessage.tsx`

```typescript
import React from 'react';
import { FaTimes } from 'react-icons/fa';
import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
  onClose: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose }) => {
  return (
    <div className="error-message">
      <p>{message}</p>
      <button onClick={onClose}>
        <FaTimes />
      </button>
    </div>
  );
};

export default ErrorMessage;
```

### Passo 5.3: Adicionar Tratamento em Componentes

```typescript
// Exemplo: CadastroMedicos.tsx
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  const result = await addMedico(formData);
  
  if (result.success) {
    setSuccess('Médico cadastrado com sucesso!');
    resetForm();
  } else {
    setError(result.error || 'Erro ao cadastrar médico');
  }
  
  setLoading(false);
};
```

---

## 📝 FASE 6: DOCUMENTAÇÃO E COMMIT (30 minutos)

### Passo 6.1: Verificar Arquivos Modificados

```bash
git status
```

### Passo 6.2: Adicionar Arquivos ao Stage

```bash
git add src/contexts/DataContext.tsx
git add src/contexts/AuthContext.tsx
git add .env.example
git add src/components/LoadingSpinner.tsx
git add src/components/ErrorMessage.tsx
# ... outros arquivos modificados
```

### Passo 6.3: Fazer Commit

```bash
git commit -m "feat: integrar frontend com backend via API REST

- Modificar DataContext.tsx para usar axios
- Implementar chamadas API para CRUD completo
- Adicionar autenticação JWT no AuthContext
- Criar componentes de loading e erro
- Configurar variáveis de ambiente (.env)
- Testar integração localmente com sucesso

BREAKING CHANGE: Sistema agora requer backend rodando
"
```

### Passo 6.4: Atualizar README.md

Adicionar seção de configuração:

```markdown
## Configuração para Desenvolvimento

### Variáveis de Ambiente

Criar arquivo `.env` na raiz do projeto:

\`\`\`env
REACT_APP_API_URL=http://localhost:3001
\`\`\`

### Iniciar Backend

\`\`\`bash
cd backend
npm install
npx prisma migrate dev
npm start
\`\`\`

### Iniciar Frontend

\`\`\`bash
npm install
npm start
\`\`\`
```

---

## ⚠️ TROUBLESHOOTING

### Problema 1: CORS Error
**Sintoma:** `Access-Control-Allow-Origin` error no console

**Solução:**
```typescript
// No backend (server.js ou app.js)
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Problema 2: Token não enviado
**Sintoma:** 401 Unauthorized nas requisições

**Solução:**
Verificar se `getAuthHeaders()` está sendo chamado em todas as requisições protegidas.

### Problema 3: Dados não carregam
**Sintoma:** Tela em branco ou loading infinito

**Solução:**
1. Verificar console do navegador (F12)
2. Verificar logs do backend
3. Confirmar que backend está rodando
4. Testar endpoints no Postman

### Problema 4: Build quebrado
**Sintoma:** `npm start` falha

**Solução:**
```bash
# Limpar node_modules e cache
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## 📊 PROGRESSO ESTIMADO

| Fase | Tempo Estimado | Complexidade |
|------|----------------|--------------|
| 1. Configuração Inicial | 30 min | Baixa |
| 2. Modificar DataContext | 2-3 horas | Alta |
| 3. Modificar AuthContext | 1-2 horas | Média |
| 4. Testes Locais | 1-2 horas | Média |
| 5. Tratamento de Erros | 1 hora | Baixa |
| 6. Documentação/Commit | 30 min | Baixa |
| **TOTAL** | **6-9 horas** | - |

**Recomendação:** Dividir em 2-3 sessões de trabalho para não cansar.

---

## ✅ CHECKLIST FINAL

Antes de considerar a integração completa:

- [ ] Todas as funções CRUD chamam API
- [ ] Login/logout funcionam corretamente
- [ ] Token JWT é enviado em todas requisições protegidas
- [ ] Loading states implementados
- [ ] Mensagens de erro aparecem
- [ ] Dados persistem no banco (não apenas localStorage)
- [ ] Dashboard calcula métricas com dados reais
- [ ] Relatórios funcionam com dados da API
- [ ] Testes manuais passaram (checklist Fase 4)
- [ ] Código commitado na branch production-integration
- [ ] README.md atualizado com instruções

---

## 🎯 PRÓXIMOS PASSOS

Após completar este guia:

1. ✅ Merge production-integration → main
2. 🚀 Deploy backend no Render
3. 🚀 Deploy frontend no Vercel
4. 🔧 Atualizar REACT_APP_API_URL para produção
5. 🧪 Testes em produção
6. 📚 Treinamento de usuários

---

**Documento criado por:** GitHub Copilot  
**Data:** 26/11/2025  
**Versão:** 1.0
