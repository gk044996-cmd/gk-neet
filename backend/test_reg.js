const fetch = require('node-fetch'); // wait, fetch is native in newer Node, but maybe not in this env. I will use http module.
const http = require('http');

const data = JSON.stringify({
  name: 'test',
  email: 'test555@gmail.com',
  password: 'password123'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/users/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
