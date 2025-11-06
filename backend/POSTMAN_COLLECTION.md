# 🧪 SGHM Backend - Postman Collection

Collection completa para testar todos os endpoints da API SGHM.

## 📁 Como Importar no Postman

1. Abra o Postman
2. Clique em "Import" 
3. Cole o JSON abaixo ou salve como `SGHM-Backend.postman_collection.json`

## 📋 Collection JSON

```json
{
  "info": {
    "name": "SGHM Backend API",
    "description": "API completa do Sistema de Gestão Hospitalar com JWT",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseURL",
      "value": "http://localhost:3001/api"
    },
    {
      "key": "token",
      "value": ""
    },
    {
      "key": "refresh_token", 
      "value": ""
    }
  ],
  "item": [
    {
      "name": "🔐 Autenticação",
      "item": [
        {
          "name": "Login",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.to.have.status(200)) {",
                  "    const response = pm.response.json();",
                  "    pm.collectionVariables.set('token', response.tokens.access_token);",
                  "    pm.collectionVariables.set('refresh_token', response.tokens.refresh_token);",
                  "    console.log('Token salvo:', response.tokens.access_token.substring(0, 20) + '...');",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@sghm.com\",\n  \"password\": \"admin123\"\n}"
            },
            "url": {
              "raw": "{{baseURL}}/auth/login",
              "host": ["{{baseURL}}"],
              "path": ["auth", "login"]
            }
          }
        },
        {
          "name": "Perfil do Usuário",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseURL}}/auth/me",
              "host": ["{{baseURL}}"],
              "path": ["auth", "me"]
            }
          }
        },
        {
          "name": "Renovar Token",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.to.have.status(200)) {",
                  "    const response = pm.response.json();",
                  "    pm.collectionVariables.set('token', response.tokens.access_token);",
                  "    console.log('Token renovado');",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"refresh_token\": \"{{refresh_token}}\"\n}"
            },
            "url": {
              "raw": "{{baseURL}}/auth/refresh",
              "host": ["{{baseURL}}"],
              "path": ["auth", "refresh"]
            }
          }
        },
        {
          "name": "Logout",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseURL}}/auth/logout",
              "host": ["{{baseURL}}"],
              "path": ["auth", "logout"]
            }
          }
        }
      ]
    },
    {
      "name": "👥 Pacientes",
      "item": [
        {
          "name": "Listar Pacientes",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseURL}}/pacientes",
              "host": ["{{baseURL}}"],
              "path": ["pacientes"]
            }
          }
        },
        {
          "name": "Criar Paciente",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"nome_paciente\": \"Maria Silva Santos\",\n  \"cpf\": \"123.456.789-00\",\n  \"data_nascimento\": \"1985-05-15\",\n  \"telefone\": \"(11) 99888-7766\",\n  \"endereco\": \"Rua das Flores, 123 - Centro\"\n}"
            },
            "url": {
              "raw": "{{baseURL}}/pacientes",
              "host": ["{{baseURL}}"],
              "path": ["pacientes"]
            }
          }
        }
      ]
    },
    {
      "name": "🩺 Médicos",
      "item": [
        {
          "name": "Listar Médicos",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseURL}}/medicos",
              "host": ["{{baseURL}}"],
              "path": ["medicos"]
            }
          }
        },
        {
          "name": "Criar Médico",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"nome_medico\": \"Dr. João Carlos Silva\",\n  \"especialidade\": \"Cardiologia\",\n  \"crm\": \"123456\",\n  \"telefone\": \"(11) 99999-8888\",\n  \"email\": \"joao.silva@clinica.com\"\n}"
            },
            "url": {
              "raw": "{{baseURL}}/medicos",
              "host": ["{{baseURL}}"],
              "path": ["medicos"]
            }
          }
        }
      ]
    },
    {
      "name": "📅 Consultas",
      "item": [
        {
          "name": "Listar Consultas",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseURL}}/consultas",
              "host": ["{{baseURL}}"],
              "path": ["consultas"]
            }
          }
        },
        {
          "name": "Consultas com Filtros",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseURL}}/consultas?status_pagamento=PENDENTE&limit=5",
              "host": ["{{baseURL}}"],
              "path": ["consultas"],
              "query": [
                {
                  "key": "status_pagamento",
                  "value": "PENDENTE"
                },
                {
                  "key": "limit",
                  "value": "5"
                }
              ]
            }
          }
        },
        {
          "name": "Criar Consulta",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"data_consulta\": \"2025-11-15\",\n  \"protocolo\": \"PROT-2025-200\",\n  \"consultorio\": \"Sala 3\",\n  \"tipo_pagamento\": \"PARTICULAR\",\n  \"valor_bruto\": 350.00,\n  \"valor_glosa\": 0.00,\n  \"valor_recebido\": 350.00,\n  \"data_recebimento\": \"2025-11-15\",\n  \"status_pagamento\": \"PAGO\",\n  \"descricao_procedimento\": \"Consulta cardiológica completa\",\n  \"medico_id\": 2,\n  \"paciente_id\": 3\n}"
            },
            "url": {
              "raw": "{{baseURL}}/consultas",
              "host": ["{{baseURL}}"],
              "path": ["consultas"]
            }
          }
        }
      ]
    },
    {
      "name": "📊 Estatísticas",
      "item": [
        {
          "name": "Resumo Geral",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseURL}}/estatisticas/resumo",
              "host": ["{{baseURL}}"],
              "path": ["estatisticas", "resumo"]
            }
          }
        },
        {
          "name": "Top Médicos por Consultas",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseURL}}/estatisticas/medicos-top?limit=3",
              "host": ["{{baseURL}}"],
              "path": ["estatisticas", "medicos-top"],
              "query": [
                {
                  "key": "limit",
                  "value": "3"
                }
              ]
            }
          }
        },
        {
          "name": "Top Médicos por Faturamento",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseURL}}/estatisticas/medicos-faturamento?limit=5",
              "host": ["{{baseURL}}"],
              "path": ["estatisticas", "medicos-faturamento"],
              "query": [
                {
                  "key": "limit",
                  "value": "5"
                }
              ]
            }
          }
        },
        {
          "name": "Faturamento Mensal",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseURL}}/estatisticas/faturamento-mensal",
              "host": ["{{baseURL}}"],
              "path": ["estatisticas", "faturamento-mensal"]
            }
          }
        }
      ]
    },
    {
      "name": "📈 Relatórios",
      "item": [
        {
          "name": "Dashboard Principal",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseURL}}/relatorios/dashboard",
              "host": ["{{baseURL}}"],
              "path": ["relatorios", "dashboard"]
            }
          }
        },
        {
          "name": "Relatório Financeiro",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseURL}}/relatorios/financeiro?data_inicio=2025-01-01&data_fim=2025-12-31",
              "host": ["{{baseURL}}"],
              "path": ["relatorios", "financeiro"],
              "query": [
                {
                  "key": "data_inicio",
                  "value": "2025-01-01"
                },
                {
                  "key": "data_fim",
                  "value": "2025-12-31"
                }
              ]
            }
          }
        },
        {
          "name": "Relatório por Médico",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseURL}}/relatorios/financeiro?medico_id=2&status_pagamento=PAGO",
              "host": ["{{baseURL}}"],
              "path": ["relatorios", "financeiro"],
              "query": [
                {
                  "key": "medico_id",
                  "value": "2"
                },
                {
                  "key": "status_pagamento",
                  "value": "PAGO"
                }
              ]
            }
          }
        }
      ]
    }
  ]
}
```

## 🛠️ Como Usar

### **1. Configuração Inicial**

1. Importe a collection no Postman
2. As variáveis `baseURL`, `token` e `refresh_token` já estão configuradas
3. Certifique-se que o servidor está rodando em `localhost:3001`

### **2. Fluxo de Teste Recomendado**

#### **Passo 1: Autenticação**
1. Execute `🔐 Autenticação > Login`
   - O token será automaticamente salvo nas variáveis
2. Teste `🔐 Autenticação > Perfil do Usuário`

#### **Passo 2: CRUD Básico**
1. `👥 Pacientes > Listar Pacientes`
2. `👥 Pacientes > Criar Paciente`
3. `🩺 Médicos > Listar Médicos`
4. `🩺 Médicos > Criar Médico`

#### **Passo 3: Consultas**
1. `📅 Consultas > Listar Consultas`
2. `📅 Consultas > Consultas com Filtros`
3. `📅 Consultas > Criar Consulta`

#### **Passo 4: Relatórios**
1. `📈 Relatórios > Dashboard Principal`
2. `📈 Relatórios > Relatório Financeiro`
3. `📊 Estatísticas > Resumo Geral`
4. `📊 Estatísticas > Top Médicos por Consultas`

### **3. Renovação Automática de Token**

O script de teste no `Login` automaticamente salva o token. Se o token expirar:
1. Execute `🔐 Autenticação > Renovar Token`
2. Ou faça login novamente

### **4. Variáveis da Collection**

- `{{baseURL}}` - URL base da API
- `{{token}}` - JWT token para autenticação
- `{{refresh_token}}` - Token para renovação

## 🧪 Testes Avançados

### **Filtros Complexos**
```
GET {{baseURL}}/consultas?medico_id=2&status_pagamento=PAGO&data_inicio=2025-01-01&limit=10
```

### **Estatísticas com Limites**
```
GET {{baseURL}}/estatisticas/medicos-top?limit=2
GET {{baseURL}}/estatisticas/medicos-faturamento?limit=3
```

### **Relatórios por Período**
```
GET {{baseURL}}/relatorios/financeiro?data_inicio=2025-11-01&data_fim=2025-11-30&status_pagamento=PENDENTE
```

## 🔧 Troubleshooting

### **Token Inválido/Expirado**
- Execute `Renovar Token` ou faça `Login` novamente

### **Servidor Não Responde**
- Verifique se o servidor está rodando: `npm start`
- Confirme a porta correta (3001)

### **Erro 404 em Endpoints**
- Verifique se a `baseURL` está correta
- Confirme se todas as rotas estão implementadas

---

**Collection atualizada:** 06/11/2025  
**Versão:** 2.0  
**Compatível com:** SGHM Backend v2.0