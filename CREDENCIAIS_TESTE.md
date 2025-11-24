# Credenciais de Teste - SGHM

## Usuários Disponíveis

### 1. Administrador
- **Email:** admin@sghm.com
- **Senha:** admin123
- **Perfil:** Admin
- **Acesso:** Total (incluindo Financeiro, Relatórios e Backup)

### 2. Operador Padrão
- **Email:** operador@sghm.com
- **Senha:** operador123
- **Perfil:** Operador
- **Acesso:** Limitado (sem acesso a Financeiro, Relatórios e Backup)

### 3. João Silva
- **Email:** joao@sghm.com
- **Senha:** 123456
- **Perfil:** Operador
- **Acesso:** Limitado (sem acesso a Financeiro, Relatórios e Backup)

---

## Diferenças entre Perfis

### Admin
✅ Dashboard  
✅ Registro de Consultas  
✅ Cadastro de Médicos  
✅ Cadastro de Pacientes  
✅ Planos de Saúde  
✅ Gestão de Honorários  
✅ Notificações  
✅ **Controle Financeiro** ⭐  
✅ **Relatórios Avançados** ⭐  
✅ **Backup e Restauração** ⭐  
✅ Perfil do Usuário  

### Operador
✅ Dashboard  
✅ Registro de Consultas  
✅ Cadastro de Médicos  
✅ Cadastro de Pacientes  
✅ Planos de Saúde  
✅ Gestão de Honorários  
✅ Notificações  
❌ Controle Financeiro (bloqueado)  
❌ Relatórios Avançados (bloqueado)  
❌ Backup e Restauração (bloqueado)  
✅ Perfil do Usuário  

---

## Como Testar

1. **Faça login com o usuário Admin** para ter acesso completo
2. **Navegue pelas páginas** e veja todas as funcionalidades
3. **Faça logout** usando o botão "Sair" no menu lateral
4. **Faça login com o usuário Operador** para ver as restrições
5. **Tente acessar** "Controle Financeiro", "Relatórios" ou "Backup" - você será redirecionado ao Dashboard

---

## Observações Importantes

- **Troca de Perfil:** Para mudar de perfil, é necessário fazer logout e login novamente
- **Sessão Persistente:** O sistema mantém a sessão mesmo após recarregar a página
- **Segurança:** Operadores não têm acesso a informações financeiras
- **Desenvolvimento:** Estas credenciais são apenas para ambiente de desenvolvimento/teste
