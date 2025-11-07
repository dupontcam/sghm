# 👥 Gestão de Usuários - Endpoints Administrativos

## 🔐 **Controle de Acesso Implementado**

### **Permissões por Role:**
- **ADMIN** - Pode criar, listar, atualizar usuários
- **OPERADOR** - Pode apenas alterar própria senha

## 📋 **Novos Endpoints Implementados**

### **1. 👤 Criar Usuário (Admin Only)**
```http
POST /api/auth/create-user
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Body:**
```json
{
  "email": "operador@sghm.com",
  "senha": "senha123",
  "nome_completo": "José Silva Operador",
  "role": "OPERADOR"
}
```

**Resposta Sucesso:**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "user": {
    "id": 3,
    "email": "operador@sghm.com",
    "nome_completo": "José Silva Operador",
    "role": "OPERADOR",
    "created_at": "2025-11-07T..."
  },
  "created_by": {
    "id": 1,
    "email": "admin@sghm.com"
  }
}
```

**Validações:**
- ✅ Email único
- ✅ Senha mínimo 6 caracteres
- ✅ Role válido (ADMIN/OPERADOR)
- ✅ Nome completo obrigatório
- ✅ Apenas Admin pode acessar

---

### **2. 🔑 Alterar Própria Senha**
```http
PUT /api/auth/change-password
Authorization: Bearer {user_token}
Content-Type: application/json
```

**Body:**
```json
{
  "senha_atual": "senha123",
  "nova_senha": "novaSenha456"
}
```

**Resposta Sucesso:**
```json
{
  "success": true,
  "message": "Senha alterada com sucesso",
  "user": {
    "id": 2,
    "email": "operador@sghm.com",
    "nome_completo": "José Silva Operador"
  }
}
```

**Validações:**
- ✅ Senha atual deve estar correta
- ✅ Nova senha mínimo 6 caracteres
- ✅ Nova senha deve ser diferente da atual
- ✅ Usuário só pode alterar própria senha

---

### **3. 📋 Listar Usuários (Admin Only)**
```http
GET /api/auth/users
Authorization: Bearer {admin_token}
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "admin@sghm.com",
      "nome_completo": "Administrador",
      "role": "ADMIN",
      "created_at": "2025-11-01T...",
      "updated_at": "2025-11-01T..."
    },
    {
      "id": 2,
      "email": "operador@sghm.com",
      "nome_completo": "José Silva Operador",
      "role": "OPERADOR",
      "created_at": "2025-11-07T...",
      "updated_at": "2025-11-07T..."
    }
  ],
  "total": 2,
  "requested_by": {
    "id": 1,
    "email": "admin@sghm.com"
  }
}
```

---

### **4. ✏️ Atualizar Usuário (Admin Only)**
```http
PUT /api/auth/users/{id}
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Body:**
```json
{
  "email": "novo.email@sghm.com",
  "nome_completo": "Nome Atualizado",
  "role": "OPERADOR"
}
```

**Resposta Sucesso:**
```json
{
  "success": true,
  "message": "Usuário atualizado com sucesso",
  "user": {
    "id": 2,
    "email": "novo.email@sghm.com",
    "nome_completo": "Nome Atualizado", 
    "role": "OPERADOR",
    "created_at": "2025-11-07T...",
    "updated_at": "2025-11-07T..."
  },
  "updated_by": {
    "id": 1,
    "email": "admin@sghm.com"
  }
}
```

**Proteções:**
- ✅ Admin não pode remover próprio role de admin
- ✅ Email deve ser único
- ✅ Apenas Admin pode acessar

---

## 🧪 **Exemplos de Teste no Postman**

### **Fluxo Completo de Teste:**

#### **1. Login como Admin**
```http
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "admin@sghm.com",
  "password": "admin123"
}
```

#### **2. Criar Operador**
```http
POST http://localhost:3001/api/auth/create-user
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "email": "maria.operadora@sghm.com",
  "senha": "operadora123",
  "nome_completo": "Maria Silva Operadora",
  "role": "OPERADOR"
}
```

#### **3. Login como Operador**
```http
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "maria.operadora@sghm.com",
  "password": "operadora123"
}
```

#### **4. Operador Altera Própria Senha**
```http
PUT http://localhost:3001/api/auth/change-password
Authorization: Bearer {operador_token}
Content-Type: application/json

{
  "senha_atual": "operadora123",
  "nova_senha": "novaSenhaSegura456"
}
```

#### **5. Admin Lista Usuários**
```http
GET http://localhost:3001/api/auth/users
Authorization: Bearer {admin_token}
```

#### **6. Admin Atualiza Usuário**
```http
PUT http://localhost:3001/api/auth/users/2
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "nome_completo": "Maria Silva Santos",
  "email": "maria.santos@sghm.com"
}
```

---

## 🔒 **Códigos de Erro**

### **Autenticação:**
- `401` - Token ausente ou inválido
- `403` - Permissões insuficientes (não é Admin)

### **Validação:**
- `400` - Dados obrigatórios ausentes
- `400` - Formato de email inválido
- `400` - Senha muito fraca (< 6 caracteres)
- `400` - Role inválido
- `400` - Senha atual incorreta
- `400` - Nova senha igual à atual

### **Conflitos:**
- `409` - Email já em uso
- `404` - Usuário não encontrado

### **Proteções Especiais:**
- `400` - Admin tentando remover próprio role de admin

---

## 🎯 **Casos de Uso Frontend**

### **Para Tela de Admin - Gestão de Usuários:**
1. **Listar usuários** - `GET /api/auth/users`
2. **Criar operador** - `POST /api/auth/create-user`
3. **Editar usuário** - `PUT /api/auth/users/{id}`

### **Para Tela de Perfil - Todos os Usuários:**
1. **Ver perfil** - `GET /api/auth/me` (já existia)
2. **Alterar senha** - `PUT /api/auth/change-password` (novo)

### **Interface Sugerida:**

#### **Admin Dashboard:**
```
┌─────────────────────────────────────┐
│ 👥 Gestão de Usuários               │
├─────────────────────────────────────┤
│ [+ Criar Usuário]                   │
│                                     │
│ 📋 Lista de Usuários:               │
│ ✓ admin@sghm.com (ADMIN)      [✏️]  │
│ ✓ operador@sghm.com (OPERADOR) [✏️]  │
└─────────────────────────────────────┘
```

#### **Perfil do Usuário:**
```
┌─────────────────────────────────────┐
│ 👤 Meu Perfil                       │
├─────────────────────────────────────┤
│ Nome: João Silva                    │
│ Email: joao@sghm.com               │
│ Role: OPERADOR                      │
│                                     │
│ 🔑 Alterar Senha:                   │
│ Senha Atual: [████████]            │
│ Nova Senha:  [████████]            │
│ [Alterar Senha]                     │
└─────────────────────────────────────┘
```

---

**Status:** ✅ **Endpoints Implementados**  
**Segurança:** 🔒 **Controle de Acesso por Role**  
**Funcionalidade:** 🎯 **Pronto para Frontend**