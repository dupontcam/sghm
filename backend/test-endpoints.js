const https = require('http');

// Dados para login
const loginData = JSON.stringify({
  email: 'admin@sghm.com',
  password: 'admin123'
});

// Configuração da requisição
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
};

console.log('🔐 Testando Login...');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', JSON.parse(data));
    
    if (res.statusCode === 200) {
      const response = JSON.parse(data);
      const token = response.tokens.access_token;
      console.log('\n✅ Login realizado com sucesso!');
      console.log('Token:', token.substring(0, 50) + '...');
      
      // Agora testar criação de usuário
      testCreateUser(token);
    }
  });
});

req.on('error', (e) => {
  console.error('Erro na requisição:', e.message);
});

req.write(loginData);
req.end();

// Função para testar criação de usuário
function testCreateUser(token) {
  console.log('\n👤 Testando Criação de Usuário...');
  
  const userData = JSON.stringify({
    email: 'teste.operador@sghm.com',
    senha: 'operador123',
    nome_completo: 'Operador Teste',
    role: 'OPERADOR'
  });

  const createOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/create-user',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Length': Buffer.byteLength(userData)
    }
  };

  const createReq = https.request(createOptions, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Response:', JSON.parse(data));
      
      if (res.statusCode === 201) {
        console.log('\n✅ Usuário criado com sucesso!');
        testListUsers(token);
      }
    });
  });

  createReq.on('error', (e) => {
    console.error('Erro na criação de usuário:', e.message);
  });

  createReq.write(userData);
  createReq.end();
}

// Função para testar listagem de usuários
function testListUsers(token) {
  console.log('\n📋 Testando Listagem de Usuários...');
  
  const listOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/users',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const listReq = https.request(listOptions, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Status:', res.statusCode);
      const response = JSON.parse(data);
      console.log('Usuários encontrados:', response.total);
      console.log('Usuários:', response.data);
      console.log('\n✅ Todos os testes completados!');
    });
  });

  listReq.on('error', (e) => {
    console.error('Erro na listagem de usuários:', e.message);
  });

  listReq.end();
}