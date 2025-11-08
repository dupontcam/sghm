# 🧪 SGHM Backend - Postman Collection

Collection completa para testar todos os endpoints da API SGHM - Sistema de Gestão de Honorários Médicos.

## 📁 Como Importar no Postman

1. Abra o Postman
2. Clique em "Import" 
3. Cole o JSON abaixo ou salve como `SGHM-Backend.postman_collection.json`

## 📋 Collection JSON

```json
{
  "info": {
    "name": "SGHM Backend API",
    "description": "API completa do Sistema de Gestão de Honorários Médicos com JWT",
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
        },
        {
          "name": "Criar Usuário (Admin Only)",
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
              "raw": "{\n  \"email\": \"operador.novo@sghm.com\",\n  \"senha\": \"operador123\",\n  \"nome_completo\": \"João Silva Operador\",\n  \"role\": \"OPERADOR\"\n}"
            },
            "url": {
              "raw": "{{baseURL}}/auth/create-user",
              "host": ["{{baseURL}}"],
              "path": ["auth", "create-user"]
            }
          }
        },
        {
          "name": "Listar Usuários (Admin Only)",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseURL}}/auth/users",
              "host": ["{{baseURL}}"],
              "path": ["auth", "users"]
            }
          }
        },
        {
          "name": "Atualizar Usuário (Admin Only)",
          "request": {
            "method": "PUT",
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
              "raw": "{\n  \"email\": \"novo.email@sghm.com\",\n  \"nome_completo\": \"Nome Atualizado\",\n  \"role\": \"OPERADOR\"\n}"
            },
            "url": {
              "raw": "{{baseURL}}/auth/users/2",
              "host": ["{{baseURL}}"],
              "path": ["auth", "users", "2"]
            }
          }
        },
        {
          "name": "Alterar Própria Senha",
          "request": {
            "method": "PUT",
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
              "raw": "{\n  \"senha_atual\": \"senhaAtual123\",\n  \"nova_senha\": \"novaSenhaSegura456\"\n}"
            },
            "url": {
              "raw": "{{baseURL}}/auth/change-password",
              "host": ["{{baseURL}}"],
              "path": ["auth", "change-password"]
            }
          }
        }
      ]
    },
    {
      "name": "🏥 Planos de Saúde",
      "item": [
        {
          "name": "Listar Planos de Saúde",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseURL}}/planos",
              "host": ["{{baseURL}}"],
              "path": ["planos"]
            }
          }
        },
        {
          "name": "Planos com Filtros",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseURL}}/planos?ativo=true&tipo_plano=CONVENIO",
              "host": ["{{baseURL}}"],
              "path": ["planos"],
              "query": [
                {
                  "key": "ativo",
                  "value": "true"
                },
                {
                  "key": "tipo_plano",
                  "value": "CONVENIO"
                }
              ]
            }
          }
        },
        {
          "name": "Buscar Plano por ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseURL}}/planos/1",
              "host": ["{{baseURL}}"],
              "path": ["planos", "1"]
            }
          }
        },
        {
          "name": "Criar Plano de Saúde (Admin Only)",
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
              "raw": "{\n  \"nome_plano\": \"Novo Convênio XYZ\",\n  \"codigo_operadora\": \"12345\",\n  \"tipo_plano\": \"CONVENIO\",\n  \"valor_consulta_padrao\": 125.00,\n  \"percentual_glosa_historica\": 5.5,\n  \"prazo_pagamento_dias\": 45,\n  \"observacoes\": \"Plano empresarial com cobertura completa\",\n  \"ativo\": true\n}"
            },
            "url": {
              "raw": "{{baseURL}}/planos",
              "host": ["{{baseURL}}"],
              "path": ["planos"]
            }
          }
        },
        {
          "name": "Atualizar Plano de Saúde (Admin Only)",
          "request": {
            "method": "PUT",
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
              "raw": "{\n  \"nome_plano\": \"Unimed Atualizado\",\n  \"valor_consulta_padrao\": 130.00,\n  \"percentual_glosa_historica\": 3.2,\n  \"prazo_pagamento_dias\": 35\n}"
            },
            "url": {
              "raw": "{{baseURL}}/planos/1",
              "host": ["{{baseURL}}"],
              "path": ["planos", "1"]
            }
          }
        },
        {
          "name": "Deletar Plano de Saúde (Admin Only)",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseURL}}/planos/1",
              "host": ["{{baseURL}}"],
              "path": ["planos", "1"]
            }
          }
        }
      ]
    },
    {
      "name": "💰 Honorários Médicos",
      "item": [
        {
          "name": "Listar Honorários",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseURL}}/honorarios",
              "host": ["{{baseURL}}"],
              "path": ["honorarios"]
            }
          }
        },
        {
          "name": "Honorários com Filtros",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseURL}}/honorarios?status_pagamento=PENDENTE&plano_saude_id=2&page=1&limit=10",
              "host": ["{{baseURL}}"],
              "path": ["honorarios"],
              "query": [
                {
                  "key": "status_pagamento",
                  "value": "PENDENTE"
                },
                {
                  "key": "plano_saude_id",
                  "value": "2"
                },
                {
                  "key": "page",
                  "value": "1"
                },
                {
                  "key": "limit",
                  "value": "10"
                }
              ]
            }
          }
        },
        {
          "name": "Dashboard de Honorários",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseURL}}/honorarios/dashboard",
              "host": ["{{baseURL}}"],
              "path": ["honorarios", "dashboard"]
            }
          }
        },
        {
          "name": "Buscar Honorário por ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseURL}}/honorarios/1",
              "host": ["{{baseURL}}"],
              "path": ["honorarios", "1"]
            }
          }
        },
        {
          "name": "Criar Honorário",
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
              "raw": "{\n  \"consulta_id\": 5,\n  \"plano_saude_id\": 2,\n  \"valor_consulta\": 120.00,\n  \"valor_glosa\": 0.00,\n  \"status_pagamento\": \"PENDENTE\",\n  \"numero_guia\": \"GUIA-2025-001\",\n  \"observacoes\": \"Consulta cardiológica de rotina\"\n}"
            },
            "url": {
              "raw": "{{baseURL}}/honorarios",
              "host": ["{{baseURL}}"],
              "path": ["honorarios"]
            }
          }
        },
        {
          "name": "Atualizar Status de Pagamento",
          "request": {
            "method": "PUT",
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
              "raw": "{\n  \"status_pagamento\": \"PAGO\",\n  \"data_pagamento\": \"2025-11-08\",\n  \"valor_glosa\": 0.00,\n  \"observacoes\": \"Pagamento processado com sucesso\"\n}"
            },
            "url": {
              "raw": "{{baseURL}}/honorarios/1",
              "host": ["{{baseURL}}"],
              "path": ["honorarios", "1"]
            }
          }
        },
        {
          "name": "Registrar Glosa",
          "request": {
            "method": "PUT",
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
              "raw": "{\n  \"status_pagamento\": \"GLOSADO\",\n  \"valor_glosa\": 25.50,\n  \"motivo_glosa\": \"Documentação incompleta - falta relatório médico\",\n  \"data_glosa\": \"2025-11-08\",\n  \"observacoes\": \"Reenviar com documentação completa\"\n}"
            },
            "url": {
              "raw": "{{baseURL}}/honorarios/2",
              "host": ["{{baseURL}}"],
              "path": ["honorarios", "2"]
            }
          }
        },
        {
          "name": "Relatório Médico Individual",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseURL}}/honorarios/relatorio-medico/2?data_inicio=2025-10-01&data_fim=2025-11-30",
              "host": ["{{baseURL}}"],
              "path": ["honorarios", "relatorio-medico", "2"],
              "query": [
                {
                  "key": "data_inicio",
                  "value": "2025-10-01"
                },
                {
                  "key": "data_fim",
                  "value": "2025-11-30"
                }
              ]
            }
          }
        },
        {
          "name": "Deletar Honorário (Admin Only)",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseURL}}/honorarios/1",
              "host": ["{{baseURL}}"],
              "path": ["honorarios", "1"]
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

#### **Passo 2: Configuração Base**
1. `🏥 Planos de Saúde > Listar Planos de Saúde`
2. `🏥 Planos de Saúde > Planos com Filtros`
3. `🏥 Planos de Saúde > Criar Plano de Saúde` (se admin)

#### **Passo 3: CRUD Básico**
1. `👥 Pacientes > Listar Pacientes`
2. `👥 Pacientes > Criar Paciente`
3. `🩺 Médicos > Listar Médicos`
4. `🩺 Médicos > Criar Médico`

#### **Passo 4: Consultas**
1. `📅 Consultas > Listar Consultas`
2. `📅 Consultas > Consultas com Filtros`
3. `📅 Consultas > Criar Consulta`

#### **Passo 5: Gestão de Honorários**
1. `💰 Honorários Médicos > Listar Honorários`
2. `💰 Honorários Médicos > Dashboard de Honorários`
3. `💰 Honorários Médicos > Honorários com Filtros`
4. `💰 Honorários Médicos > Criar Honorário`
5. `💰 Honorários Médicos > Atualizar Status de Pagamento`
6. `💰 Honorários Médicos > Registrar Glosa`
7. `💰 Honorários Médicos > Relatório Médico Individual`

#### **Passo 6: Relatórios e Estatísticas**
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
# Consultas
GET {{baseURL}}/consultas?medico_id=2&status_pagamento=PAGO&data_inicio=2025-01-01&limit=10

# Honorários com múltiplos filtros
GET {{baseURL}}/honorarios?status_pagamento=PENDENTE&medico_id=2&data_inicio=2025-10-01&data_fim=2025-11-30&page=1&limit=20

# Planos de saúde ativos por tipo
GET {{baseURL}}/planos?ativo=true&tipo_plano=CONVENIO&search=Unimed
```

### **Estatísticas com Limites**
```
GET {{baseURL}}/estatisticas/medicos-top?limit=2
GET {{baseURL}}/estatisticas/medicos-faturamento?limit=3
```

### **Relatórios por Período**
```
# Relatório financeiro geral
GET {{baseURL}}/relatorios/financeiro?data_inicio=2025-11-01&data_fim=2025-11-30&status_pagamento=PENDENTE

# Relatório específico por médico
GET {{baseURL}}/honorarios/relatorio-medico/2?data_inicio=2025-10-01&data_fim=2025-11-08
```

### **Dashboard Completo**
```
# Dashboard de honorários (30 dias)
GET {{baseURL}}/honorarios/dashboard

# Resumo geral do sistema
GET {{baseURL}}/estatisticas/resumo
```

### **Testes de Fluxo de Pagamento**
```
# 1. Criar honorário
POST {{baseURL}}/honorarios
Body: {"consulta_id": 5, "plano_saude_id": 2, "valor_consulta": 120.00}

# 2. Atualizar para ENVIADO
PUT {{baseURL}}/honorarios/1
Body: {"status_pagamento": "ENVIADO"}

# 3. Processar pagamento
PUT {{baseURL}}/honorarios/1
Body: {"status_pagamento": "PAGO", "data_pagamento": "2025-11-08"}

# 4. Ou registrar glosa
PUT {{baseURL}}/honorarios/2
Body: {"status_pagamento": "GLOSADO", "valor_glosa": 25.50, "motivo_glosa": "Documentação incompleta"}
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

### **Problemas com Honorários/Planos**
- Verifique se os IDs de consulta/plano existem antes de criar honorários
- Confirme que o médico tem consultas associadas para relatórios

---

**Collection atualizada:** 08/11/2025  
**Versão:** 3.0  
**Compatível com:** SGHM Backend v3.0  

## 🆕 **Novidades da Versão 3.0**

✅ **Planos de Saúde:** CRUD completo para gestão de operadoras  
✅ **Honorários Médicos:** Sistema completo de controle financeiro  
✅ **Dashboard Avançado:** Estatísticas detalhadas dos últimos 30 dias  
✅ **Relatórios Médicos:** Relatórios individuais por médico e período  
✅ **Gestão de Glosas:** Controle completo de glosas e motivos  
✅ **Múltiplos Status:** PENDENTE, ENVIADO, PAGO, GLOSADO, CANCELADO  

**APIs Implementadas:**
- 🔐 8 endpoints de autenticação
- 🏥 6 endpoints de planos de saúde  
- 💰 9 endpoints de honorários médicos
- 👥 2 endpoints de pacientes
- 🩺 2 endpoints de médicos  
- 📅 3 endpoints de consultas
- 📊 4 endpoints de estatísticas
- 📈 3 endpoints de relatórios

**Total:** 37 endpoints funcionais

**Status do Sistema:** ✅ **100% Funcional e Testado**