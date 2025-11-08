// Teste simples para verificar se o servidor está respondendo
const http = require('http');

console.log('🔍 Testando conectividade básica com servidor...');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const postData = JSON.stringify({
  email: 'admin@sghm.com',
  senha: 'admin123'
});

const req = http.request(options, (res) => {
  console.log(`✅ Conexão estabelecida! Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📋 Resposta do servidor:', data);
  });
});

req.on('error', (e) => {
  console.log(`❌ Erro na requisição: ${e.message}`);
});

req.write(postData);
req.end();

// Também testar um GET simples
setTimeout(() => {
  console.log('\n🔍 Testando GET básico...');
  
  const getOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/',
    method: 'GET'
  };
  
  const getReq = http.request(getOptions, (res) => {
    console.log(`✅ GET Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📋 Resposta GET:', data || 'Sem conteúdo');
    });
  });
  
  getReq.on('error', (e) => {
    console.log(`❌ Erro no GET: ${e.message}`);
  });
  
  getReq.end();
}, 1000);