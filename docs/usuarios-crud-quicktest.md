# Teste Rápido — CRUD de Usuários (Windows cmd)

Pré-requisitos:
- Backend rodando em `http://localhost:3001`
- Usuário admin criado (admin@sghm.com / admin123)

1) Login (obter token)
```
curl -s -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@sghm.com\",\"senha\":\"admin123\"}"
```
Copie o valor de `data.token`.

2) Listar usuários
```
curl -s http://localhost:3001/api/auth/users -H "Authorization: Bearer SEU_TOKEN"
```

3) Criar usuário (Operador)
```
curl -s -X POST http://localhost:3001/api/auth/create-user ^
  -H "Authorization: Bearer SEU_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"nome\":\"Operador Teste\",\"email\":\"operador.teste@sghm.com\",\"senha\":\"Operador123\",\"role\":\"OPERADOR\"}"
```
Anote o `id` retornado.

4) Atualizar usuário
```
curl -s -X PUT http://localhost:3001/api/auth/users/ID_DO_USUARIO ^
  -H "Authorization: Bearer SEU_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"nome_completo\":\"Operador Atualizado\",\"email\":\"operador.atualizado@sghm.com\",\"role\":\"OPERADOR\"}"
```

5) Excluir usuário
```
curl -s -X DELETE http://localhost:3001/api/auth/users/ID_DO_USUARIO ^
  -H "Authorization: Bearer SEU_TOKEN"
```
Observações:
- O backend impede excluir a si mesmo e o último ADMIN.
- A resposta do DELETE é `204 No Content` quando bem-sucedido.
