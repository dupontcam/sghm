const fetch = require('node-fetch');

async function testLogin() {
    const url = 'http://localhost:3001/api/auth/login';
    const body = {
        email: 'admin@sghm.com',
        senha: 'admin'
    };

    console.log('Testing login to:', url);
    console.log('Body:', body);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testLogin();
