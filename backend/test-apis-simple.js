const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001/api';

// Simular login para obter token
async function login() {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@sghm.com',
        senha: 'admin123'
      })
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log('✅ Login bem-sucedido');
      return data.data.token;
    } else {
      console.log('❌ Erro no login:', data);
      return null;
    }
  } catch (error) {
    console.log('❌ Erro de conexão no login:', error.message);
    return null;
  }
}

// Testar API de Planos de Saúde
async function testPlanos(token) {
  console.log('\n=== TESTANDO API DE PLANOS DE SAÚDE ===');
  
  try {
    const response = await fetch(`${BASE_URL}/planos`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log('✅ GET /planos - Sucesso');
      console.log(`📊 Total de planos encontrados: ${data.data.planos.length}`);
      data.data.planos.forEach(plano => {
        console.log(`   - ${plano.nome_plano} (${plano.tipo_plano}) - R$ ${plano.valor_consulta_padrao}`);
      });
    } else {
      console.log('❌ GET /planos - Erro:', data);
    }
  } catch (error) {
    console.log('❌ Erro de conexão em /planos:', error.message);
  }
}

// Testar API de Honorários
async function testHonorarios(token) {
  console.log('\n=== TESTANDO API DE HONORÁRIOS ===');
  
  try {
    const response = await fetch(`${BASE_URL}/honorarios`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log('✅ GET /honorarios - Sucesso');
      console.log(`📊 Total de honorários encontrados: ${data.data.honorarios.length}`);
      
      if (data.data.honorarios.length > 0) {
        const primeiro = data.data.honorarios[0];
        console.log(`   Exemplo: Consulta ID ${primeiro.consulta_id} - R$ ${primeiro.valor_consulta} (Status: ${primeiro.status_pagamento})`);
      }
    } else {
      console.log('❌ GET /honorarios - Erro:', data);
    }
  } catch (error) {
    console.log('❌ Erro de conexão em /honorarios:', error.message);
  }
}

// Testar Dashboard
async function testDashboard(token) {
  console.log('\n=== TESTANDO DASHBOARD ===');
  
  try {
    const response = await fetch(`${BASE_URL}/honorarios/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log('✅ GET /honorarios/dashboard - Sucesso');
      console.log(`📊 Total de consultas: ${data.data.estatisticas_gerais.total_consultas}`);
      console.log(`💰 Valor total: R$ ${data.data.estatisticas_gerais.valor_total}`);
      console.log(`� Valor glosas: R$ ${data.data.estatisticas_gerais.valor_glosas}`);
      console.log(`📈 Valor líquido: R$ ${data.data.estatisticas_gerais.valor_liquido}`);
      console.log(`🏥 Taxa de glosa: ${data.data.estatisticas_gerais.taxa_glosa.toFixed(2)}%`);
    } else {
      console.log('❌ GET /honorarios/dashboard - Erro:', data);
    }
  } catch (error) {
    console.log('❌ Erro de conexão em dashboard:', error.message);
  }
}

// Executar todos os testes
async function runTests() {
  console.log('🚀 Iniciando testes das APIs...\n');
  
  const token = await login();
  if (!token) {
    console.log('❌ Não foi possível obter token. Parando testes.');
    return;
  }
  
  await testPlanos(token);
  await testHonorarios(token);
  await testDashboard(token);
  
  console.log('\n✅ Testes finalizados!');
}

// Verificar se node-fetch está disponível
try {
  require.resolve('node-fetch');
  runTests();
} catch (e) {
  console.log('❌ Erro: node-fetch não encontrado. Instalando...');
  console.log('Execute: npm install node-fetch@2');
}